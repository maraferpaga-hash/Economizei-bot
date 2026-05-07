const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Garante que o usuário existe — cria na primeira mensagem, ignora se já existir
async function upsertUsuario(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .upsert({ phone_number: phoneNumber }, { onConflict: 'phone_number', ignoreDuplicates: true })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[supabase] upsertUsuario:', err.message);
    throw err;
  }
}

// Salva a compra, os itens e incrementa o contador mensal do usuário
async function salvarCompra(phoneNumber, dados) {
  const { loja, total, data_compra, itens = [] } = dados;

  try {
    // 1. Insere a compra e recupera o id gerado
    const { data: compra, error: erroCompra } = await supabase
      .from('compras')
      .insert({ phone_number: phoneNumber, loja, total, data_compra })
      .select()
      .single();

    if (erroCompra) throw erroCompra;

    // 2. Insere os itens vinculados ao id da compra
    if (itens.length > 0) {
      const linhasItens = itens.map((item) => ({
        compra_id: compra.id,
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade,
      }));

      const { error: erroItens } = await supabase
        .from('itens_compra')
        .insert(linhasItens);

      if (erroItens) throw erroItens;
    }

    // 3. Incrementa o contador de compras do mês atual do usuário
    const { error: erroUpdate } = await supabase.rpc('incrementar_compras_mes', {
      p_phone_number: phoneNumber,
    });

    // Fallback manual caso a RPC não exista ainda
    if (erroUpdate) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('compras_mes_atual')
        .eq('phone_number', phoneNumber)
        .single();

      await supabase
        .from('usuarios')
        .update({ compras_mes_atual: (usuario?.compras_mes_atual ?? 0) + 1 })
        .eq('phone_number', phoneNumber);
    }

    return compra;
  } catch (err) {
    console.error('[supabase] salvarCompra:', err.message);
    throw err;
  }
}

// Retorna as últimas N compras e a soma do mês atual
async function buscarHistorico(phoneNumber, limite = 5) {
  try {
    const { data: compras, error: erroCompras } = await supabase
      .from('compras')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('criado_em', { ascending: false })
      .limit(limite);

    if (erroCompras) throw erroCompras;

    // Soma do mês atual (mês corrente no servidor)
    const inicioDomes = new Date();
    inicioDomes.setDate(1);
    inicioDomes.setHours(0, 0, 0, 0);

    const { data: somaMes, error: erroSoma } = await supabase
      .from('compras')
      .select('total')
      .eq('phone_number', phoneNumber)
      .gte('data_compra', inicioDomes.toISOString().split('T')[0]);

    if (erroSoma) throw erroSoma;

    const totalMes = somaMes.reduce((acc, c) => acc + Number(c.total), 0);

    return { compras, totalMes };
  } catch (err) {
    console.error('[supabase] buscarHistorico:', err.message);
    throw err;
  }
}

// Retorna a média de gastos dos últimos 90 dias, ou null se menos de 3 compras
async function calcularMedia(phoneNumber) {
  try {
    const noventa_dias_atras = new Date();
    noventa_dias_atras.setDate(noventa_dias_atras.getDate() - 90);

    const { data, error } = await supabase
      .from('compras')
      .select('total')
      .eq('phone_number', phoneNumber)
      .gte('data_compra', noventa_dias_atras.toISOString().split('T')[0]);

    if (error) throw error;

    if (data.length < 3) return null;

    const soma = data.reduce((acc, c) => acc + Number(c.total), 0);
    return soma / data.length;
  } catch (err) {
    console.error('[supabase] calcularMedia:', err.message);
    throw err;
  }
}

// Retorna true se o usuário gratuito atingiu o limite de 3 compras no mês
async function verificarLimiteGratuito(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('compras_mes_atual, is_pro')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) throw error;

    return data.compras_mes_atual >= 3 && data.is_pro === false;
  } catch (err) {
    console.error('[supabase] verificarLimiteGratuito:', err.message);
    throw err;
  }
}

module.exports = {
  upsertUsuario,
  salvarCompra,
  buscarHistorico,
  calcularMedia,
  verificarLimiteGratuito,
};
