const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const { log, maskPhone } = require('./logger');

// Node.js < 22 não tem WebSocket nativo — passa o pacote ws como transport
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { realtime: { transport: ws } }
);

// Garante que o usuário existe — cria na primeira mensagem, ignora se já existir
async function upsertUsuario(phoneNumber) {
  try {
    // ignoreDuplicates não retorna dados de linhas já existentes — SELECT separado garante isso
    await supabase
      .from('usuarios')
      .upsert({ phone_number: phoneNumber }, { onConflict: 'phone_number', ignoreDuplicates: true });

    const { data, error } = await supabase
      .from('usuarios')
      .select('phone_number, compras_mes_atual, is_pro, beta_fundador, onboarding_step')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    log('supabase_erro', { fn: 'upsertUsuario', erro: err.message });
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
        // Gemini retorna preco_unitario; fallback para preco (compatibilidade futura)
        preco: item.preco_unitario ?? item.preco ?? null,
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
    log('supabase_erro', { fn: 'salvarCompra', erro: err.message });
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
    log('supabase_erro', { fn: 'buscarHistorico', erro: err.message });
    throw err;
  }
}

// Retorna a média de gastos dos últimos 90 dias, ou null se menos de 3 compras
async function calcularMedia(phoneNumber) {
  try {
    const noventaDiasAtras = new Date();
    noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

    const { data, error } = await supabase
      .from('compras')
      .select('total')
      .eq('phone_number', phoneNumber)
      .gte('data_compra', noventaDiasAtras.toISOString().split('T')[0]);

    if (error) throw error;

    if (data.length < 3) return null;

    const soma = data.reduce((acc, c) => acc + Number(c.total), 0);
    return soma / data.length;
  } catch (err) {
    log('supabase_erro', { fn: 'calcularMedia', erro: err.message });
    throw err;
  }
}

// Retorna objeto { atingido, cuponsUsados, limite, isBetaFundador } para verificar cota do plano gratuito
// Zera compras_mes_atual automaticamente se o último uso foi em mês diferente do atual
async function verificarLimiteGratuito(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('compras_mes_atual, is_pro, beta_fundador, mes_referencia')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) throw error;

    // mes_referencia: "YYYY-MM" — se divergir do mês atual, zera o contador
    const mesAtual = new Date().toISOString().slice(0, 7); // ex: "2026-05"
    if ((data.mes_referencia ?? '') !== mesAtual) {
      await supabase
        .from('usuarios')
        .update({ compras_mes_atual: 0, mes_referencia: mesAtual })
        .eq('phone_number', phoneNumber);
      data.compras_mes_atual = 0;
      log('compras_mes_resetado', { phone: maskPhone(phoneNumber), mes: mesAtual });
    }

    const cuponsUsados = data.compras_mes_atual ?? 0;
    const LIMITE = 10;
    return {
      atingido: !data.is_pro && cuponsUsados >= LIMITE,
      cuponsUsados,
      limite: LIMITE,
      isBetaFundador: data.beta_fundador ?? false,
    };
  } catch (err) {
    log('supabase_erro', { fn: 'verificarLimiteGratuito', erro: err.message });
    throw err;
  }
}

// Retorna status consolidado do usuário — usado no comando /status ou /plano
async function buscarStatusUsuario(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('compras_mes_atual, is_pro, beta_fundador')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) throw error;

    return {
      isBetaFundador: data.beta_fundador ?? false,
      isPro: data.is_pro ?? false,
      cuponsUsados: data.compras_mes_atual ?? 0,
      limite: 10,
    };
  } catch (err) {
    log('supabase_erro', { fn: 'buscarStatusUsuario', erro: err.message });
    throw err;
  }
}

async function atualizarOnboardingStep(phoneNumber, novoStep) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ onboarding_step: novoStep })
      .eq('phone_number', phoneNumber);
    if (error) throw error;
  } catch (err) {
    log('supabase_erro', { fn: 'atualizarOnboardingStep', erro: err.message });
    throw err;
  }
}

async function salvarWaitlist({ nome, whatsapp, plano_interesse, variant_ab,
                                utm_source, utm_medium, utm_campaign, utm_content }) {
  try {
    const { error } = await supabase.from('waitlist').insert({
      nome, whatsapp, plano_interesse, variant_ab,
      utm_source, utm_medium, utm_campaign, utm_content,
    });
    if (error) throw error;
  } catch (err) {
    log('supabase_erro', { fn: 'salvarWaitlist', erro: err.message });
    throw err;
  }
}

async function listarUsuariosAtivosNoMes(mesReferencia) {
  const primeiroDia = `${mesReferencia}-01`;
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const proximoMes = mes === 12
    ? `${ano + 1}-01-01`
    : `${ano}-${String(mes + 1).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('compras')
    .select('phone_number')
    .gte('data_compra', primeiroDia)
    .lt('data_compra', proximoMes);

  if (error) {
    log('supabase_erro', { fn: 'listarUsuariosAtivosNoMes', erro: error.message });
    throw error;
  }
  return [...new Set((data || []).map(r => r.phone_number))];
}

async function buscarComprasDoMes(phoneNumber, mesReferencia) {
  const primeiroDia = `${mesReferencia}-01`;
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const proximoMes = mes === 12
    ? `${ano + 1}-01-01`
    : `${ano}-${String(mes + 1).padStart(2, '0')}-01`;

  const { data: compras, error: errC } = await supabase
    .from('compras')
    .select('id, loja, total, data_compra')
    .eq('phone_number', phoneNumber)
    .gte('data_compra', primeiroDia)
    .lt('data_compra', proximoMes);

  if (errC) {
    log('supabase_erro', { fn: 'buscarComprasDoMes', erro: errC.message });
    throw errC;
  }
  if (!compras || compras.length === 0) return null;

  const ids = compras.map(c => c.id);
  const { data: itens, error: errI } = await supabase
    .from('itens_compra')
    .select('compra_id, nome, quantidade, preco')
    .in('compra_id', ids);

  if (errI) {
    log('supabase_erro', { fn: 'buscarComprasDoMes_itens', erro: errI.message });
    throw errI;
  }

  const totalGasto = compras.reduce((s, c) => s + Number(c.total), 0);
  const qtdCompras = compras.length;
  const ticketMedio = qtdCompras > 0 ? totalGasto / qtdCompras : 0;

  const lojaMap = {};
  for (const c of compras) {
    if (!lojaMap[c.loja]) lojaMap[c.loja] = { total: 0, qtd: 0 };
    lojaMap[c.loja].total += Number(c.total);
    lojaMap[c.loja].qtd += 1;
  }
  const topLojas = Object.entries(lojaMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3)
    .map(([loja, dados]) => ({ loja, total: dados.total, qtd: dados.qtd }));

  const itemMap = {};
  for (const it of (itens || [])) {
    if (!itemMap[it.nome]) itemMap[it.nome] = { nome: it.nome, quantidade: 0, gastoTotal: 0 };
    itemMap[it.nome].quantidade += Number(it.quantidade);
    itemMap[it.nome].gastoTotal += Number(it.preco) * Number(it.quantidade);
  }
  const topItens = Object.values(itemMap)
    .sort((a, b) => b.gastoTotal - a.gastoTotal)
    .slice(0, 5);

  return { compras, totalGasto, qtdCompras, ticketMedio, topLojas, topItens };
}

async function verificarResumoJaEnviado(phoneNumber, mesReferencia) {
  const { data, error } = await supabase
    .from('resumos_mensais_enviados')
    .select('id')
    .eq('phone_number', phoneNumber)
    .eq('mes_referencia', mesReferencia)
    .maybeSingle();

  if (error) {
    log('supabase_erro', { fn: 'verificarResumoJaEnviado', erro: error.message });
    throw error;
  }
  return !!data;
}

async function marcarResumoEnviado(phoneNumber, mesReferencia, totalCompras, totalGasto) {
  const { error } = await supabase
    .from('resumos_mensais_enviados')
    .upsert(
      { phone_number: phoneNumber, mes_referencia: mesReferencia,
        total_compras: totalCompras, total_gasto: totalGasto },
      { onConflict: 'phone_number,mes_referencia', ignoreDuplicates: true }
    );

  if (error) {
    log('supabase_erro', { fn: 'marcarResumoEnviado', erro: error.message });
    throw error;
  }
}

module.exports = {
  upsertUsuario,
  salvarCompra,
  buscarHistorico,
  calcularMedia,
  verificarLimiteGratuito,
  buscarStatusUsuario,
  atualizarOnboardingStep,
  salvarWaitlist,
  listarUsuariosAtivosNoMes,
  buscarComprasDoMes,
  verificarResumoJaEnviado,
  marcarResumoEnviado,
};
