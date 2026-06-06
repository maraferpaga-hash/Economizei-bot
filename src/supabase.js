const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const { log, maskPhone } = require('./logger');

// Usa service_role key no servidor (bypassa RLS, nunca exposta ao cliente).
// Fallback para anon key durante a transição — remover quando RLS estiver ativo.
// Ver: supabase/rls_migration.sql
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
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
    log('supabase_erro', { fn: 'upsertUsuario', erro: err.message, causa: err.cause?.message ?? err.cause ?? null });
    throw err;
  }
}

// Salva a compra, os itens e incrementa o contador mensal do usuário
async function salvarCompra(phoneNumber, dados) {
  const { loja, total, data_compra, itens = [], tipo = 'mercado' } = dados;

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
        compra_id:     compra.id,
        nome:          item.nome,
        // Gemini retorna preco_unitario; fallback para preco (compatibilidade futura)
        preco:         item.preco_unitario ?? item.preco ?? null,
        quantidade:    item.quantidade,
        categoria:     item.categoria     ?? null,
        nome_canonico: item.nome_canonico ?? null,
      }));

      // [DIAGNÓSTICO TEMPORÁRIO — remover após confirmar fix de categoria/nome_canonico]
      // Loga o que está SENDO ENVIADO ao INSERT. Se este log NÃO aparecer no Railway
      // ao processar um cupom, o build em produção é antigo (não é o commit ae58972).
      log('diag_itens_antes_insert', {
        qtd: linhasItens.length,
        amostra: linhasItens.slice(0, 3).map(l => ({
          nome: (l.nome || '').slice(0, 30),
          categoria: l.categoria,
          nome_canonico: l.nome_canonico,
        })),
      });

      const { data: itensInseridos, error: erroItens } = await supabase
        .from('itens_compra')
        .insert(linhasItens)
        .select('categoria, nome_canonico');

      if (erroItens) {
        // [DIAGNÓSTICO TEMPORÁRIO] erro explícito do INSERT (ex: PGRST204 = coluna
        // ausente no schema cache do PostgREST).
        log('diag_insert_itens_erro', { erro: erroItens.message, code: erroItens.code, details: erroItens.details });
        throw erroItens;
      }

      // [DIAGNÓSTICO TEMPORÁRIO] confirma o que o banco GRAVOU de fato.
      log('diag_itens_gravados', {
        qtd: itensInseridos?.length ?? 0,
        amostra: (itensInseridos || []).slice(0, 3),
      });

      // Registra preços anônimos para o comparativo de mercados (fire-and-forget).
      // Cupom não-mercado (tipo='outros') NÃO entra no comparativo de mercados —
      // farmácia/posto/restaurante poluiriam a base de preços de supermercado.
      if (tipo !== 'outros') {
        registrarPrecosMercado(phoneNumber, dados.loja, dados.cnpj ?? null, itens)
          .catch(err => log('precos_mercado_erro', { fn: 'salvarCompra', erro: err.message }));
      }
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

// ---------------------------------------------------------------
// Preços de mercado anônimos (base do comparativo futuro)
// ---------------------------------------------------------------

// Registra preços dos itens na tabela compartilhada, respeitando opt-out.
// Fire-and-forget — erros são logados mas não bloqueiam o fluxo principal.
async function registrarPrecosMercado(phoneNumber, loja, cnpj, itens) {
  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('opt_out_precos')
      .eq('phone_number', phoneNumber)
      .single();

    if (usuario?.opt_out_precos) return; // usuário optou por não compartilhar

    const hoje = new Date().toISOString().split('T')[0];
    const linhas = itens
      .filter(i => i.nome_canonico && (i.preco_unitario ?? i.preco) > 0)
      .map(i => ({
        produto_canonico: i.nome_canonico,
        loja,
        cnpj:       cnpj || null,
        preco_unit: i.preco_unitario ?? i.preco,
        data_obs:   hoje,
      }));

    if (linhas.length === 0) return;

    await supabase.from('precos_mercado').insert(linhas);
    log('precos_mercado_registrados', { loja, qtd: linhas.length });
  } catch (err) {
    log('precos_mercado_erro', { fn: 'registrarPrecosMercado', erro: err.message });
  }
}

// Retorna breakdown de gastos por categoria no mês informado.
// Só inclui itens com categoria definida (compras feitas após a migration).
async function buscarGastosPorCategoria(phoneNumber, mesReferencia) {
  try {
    const primeiroDia = `${mesReferencia}-01`;
    const [ano, mes] = mesReferencia.split('-').map(Number);
    const proximoMes = mes === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mes + 1).padStart(2, '0')}-01`;

    const { data: compras, error: errC } = await supabase
      .from('compras')
      .select('id')
      .eq('phone_number', phoneNumber)
      .gte('data_compra', primeiroDia)
      .lt('data_compra', proximoMes);

    if (errC) throw errC;
    if (!compras || compras.length === 0) return [];

    const ids = compras.map(c => c.id);
    const { data: itens, error: errI } = await supabase
      .from('itens_compra')
      .select('categoria, preco, quantidade')
      .in('compra_id', ids)
      .not('categoria', 'is', null);

    if (errI) throw errI;
    if (!itens || itens.length === 0) return [];

    // Agrega totais por categoria em JS (volume pequeno por usuário/mês)
    const catMap = {};
    for (const item of itens) {
      const cat = item.categoria || 'outros';
      if (!catMap[cat]) catMap[cat] = 0;
      catMap[cat] += (Number(item.preco) || 0) * (Number(item.quantidade) || 1);
    }

    return Object.entries(catMap)
      .map(([categoria, total]) => ({ categoria, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);
  } catch (err) {
    log('supabase_erro', { fn: 'buscarGastosPorCategoria', erro: err.message });
    return [];
  }
}

// Opt-out/in do compartilhamento anônimo de preços
async function setOptOutPrecos(phoneNumber, valor) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ opt_out_precos: valor })
      .eq('phone_number', phoneNumber);
    if (error) throw error;
    log('opt_out_precos_atualizado', { phone: maskPhone(phoneNumber), valor });
  } catch (err) {
    log('supabase_erro', { fn: 'setOptOutPrecos', erro: err.message });
    throw err;
  }
}

// ---------------------------------------------------------------

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

// ---------------------------------------------------------------
// Reengajamento — busca de usuários elegíveis + controle de lembretes
// ---------------------------------------------------------------

// Retorna { inicio, fim } (ISO) da janela de 1 dia que ocorreu há `dias` dias.
// Ex: dias=3 hoje (05) → janela do dia 02 (00:00 até 03 00:00). Usado para
// casar "exatamente há N dias" por dia de calendário (horário do servidor).
function _janelaDiaAtras(dias) {
  const alvo = new Date();
  alvo.setHours(0, 0, 0, 0);
  alvo.setDate(alvo.getDate() - dias);

  const inicio = new Date(alvo);
  const fim = new Date(alvo);
  fim.setDate(fim.getDate() + 1);

  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

// Segmento A — usuários que se cadastraram há `diasDesde` dias e nunca mandaram
// cupom (compras_mes_atual = 0, onboarding_step entre 1 e 2).
// onboarding_step = 0 (nunca respondeu às boas-vindas) é excluído de propósito.
async function buscarElegiveisOnboarding(diasDesde) {
  try {
    const { inicio, fim } = _janelaDiaAtras(diasDesde);
    const { data, error } = await supabase
      .from('usuarios')
      .select('phone_number, compras_mes_atual, onboarding_step')
      .gte('criado_em', inicio)
      .lt('criado_em', fim)
      .eq('compras_mes_atual', 0)
      .gte('onboarding_step', 1)
      .lt('onboarding_step', 3);

    if (error) throw error;
    return data || [];
  } catch (err) {
    log('supabase_erro', { fn: 'buscarElegiveisOnboarding', erro: err.message });
    throw err;
  }
}

// Segmento B — usuários cuja última compra (última linha em `compras`) foi
// exatamente há `diasDesde` dias. Agrega o último criado_em por usuário em JS
// (volume pequeno no Beta) e cruza com `usuarios` para trazer contador/step.
async function buscarElegiveisInativos(diasDesde) {
  try {
    const { inicio, fim } = _janelaDiaAtras(diasDesde);

    // Última atividade por usuário: criado_em desc → primeira ocorrência = mais recente
    const { data, error } = await supabase
      .from('compras')
      .select('phone_number, criado_em')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    const ultimaPorUsuario = {};
    for (const row of (data || [])) {
      if (!ultimaPorUsuario[row.phone_number]) {
        ultimaPorUsuario[row.phone_number] = row.criado_em;
      }
    }

    const phonesAlvo = Object.entries(ultimaPorUsuario)
      .filter(([, ultima]) => ultima >= inicio && ultima < fim)
      .map(([phone]) => phone);

    if (phonesAlvo.length === 0) return [];

    const { data: usuarios, error: errU } = await supabase
      .from('usuarios')
      .select('phone_number, compras_mes_atual, onboarding_step, is_pro')
      .in('phone_number', phonesAlvo);

    if (errU) throw errU;

    // Nunca enviar para quem nem respondeu às boas-vindas (onboarding_step = 0)
    return (usuarios || []).filter(u => (u.onboarding_step ?? 0) > 0);
  } catch (err) {
    log('supabase_erro', { fn: 'buscarElegiveisInativos', erro: err.message });
    throw err;
  }
}

// Segmento D — usuários no plano gratuito que chegaram a 8 cupons no mês.
async function buscarElegiveisLimiteAviso() {
  try {
    const mesAtual = new Date().toISOString().slice(0, 7);
    const { data, error } = await supabase
      .from('usuarios')
      .select('phone_number, compras_mes_atual, onboarding_step, is_pro')
      .eq('compras_mes_atual', 8)
      .eq('is_pro', false)
      .eq('mes_referencia', mesAtual)
      .gte('onboarding_step', 1);

    if (error) throw error;
    return data || [];
  } catch (err) {
    log('supabase_erro', { fn: 'buscarElegiveisLimiteAviso', erro: err.message });
    throw err;
  }
}

// Segmento C — usuários ativos no mês corrente (>= 1 cupom no mês) com
// onboarding concluído. Usado para o teaser de fim de mês (dias 26–27).
async function buscarElegiveisFinsDeMes() {
  try {
    const mesAtual = new Date().toISOString().slice(0, 7);
    const { data, error } = await supabase
      .from('usuarios')
      .select('phone_number, compras_mes_atual, onboarding_step')
      .gt('compras_mes_atual', 0)
      .gte('onboarding_step', 3)
      .eq('mes_referencia', mesAtual);

    if (error) throw error;
    return data || [];
  } catch (err) {
    log('supabase_erro', { fn: 'buscarElegiveisFinsDeMes', erro: err.message });
    throw err;
  }
}

// Verifica se um lembrete já foi enviado para o usuário.
// mesReferencia = null para lembretes de ciclo único (onboarding, inativo).
async function lembreteFoiEnviado(phoneNumber, lembreteId, mesReferencia = null) {
  try {
    let query = supabase
      .from('lembretes_enviados')
      .select('id')
      .eq('phone_number', phoneNumber)
      .eq('lembrete_id', lembreteId);

    query = mesReferencia === null
      ? query.is('mes_referencia', null)
      : query.eq('mes_referencia', mesReferencia);

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return !!data;
  } catch (err) {
    log('supabase_erro', { fn: 'lembreteFoiEnviado', erro: err.message });
    throw err;
  }
}

// Registra que um lembrete foi enviado ao usuário.
async function registrarLembreteEnviado(phoneNumber, lembreteId, mesReferencia = null) {
  try {
    const { error } = await supabase
      .from('lembretes_enviados')
      .insert({ phone_number: phoneNumber, lembrete_id: lembreteId, mes_referencia: mesReferencia });

    if (error) throw error;
  } catch (err) {
    log('supabase_erro', { fn: 'registrarLembreteEnviado', erro: err.message });
    throw err;
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
  buscarGastosPorCategoria,
  setOptOutPrecos,
  buscarElegiveisOnboarding,
  buscarElegiveisInativos,
  buscarElegiveisLimiteAviso,
  buscarElegiveisFinsDeMes,
  lembreteFoiEnviado,
  registrarLembreteEnviado,
};
