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
      .select('phone_number, compras_mes_atual, is_pro, beta_fundador, onboarding_step, features_pro_ate, plano, assinatura_status, assinatura_pendente_plano, mp_preapproval_id')
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
    // 1. Insere a compra e recupera o id gerado.
    // `tipo` (mercado/outros) é gravado para a média de gastos poder filtrar
    // só compras de mercado (decisão 2026-06-07).
    const { data: compra, error: erroCompra } = await supabase
      .from('compras')
      .insert({ phone_number: phoneNumber, loja, total, data_compra, tipo })
      .select()
      .single();

    if (erroCompra) throw erroCompra;

    // 2. Insere os itens vinculados ao id da compra.
    // preco       = preço unitário (mantido para compatibilidade/exibição)
    // preco_total = total da linha como impresso no cupom — fonte de verdade
    //               para agregação por categoria (decisão 2026-06-07).
    if (itens.length > 0) {
      const linhasItens = itens.map((item) => ({
        compra_id:     compra.id,
        nome:          item.nome,
        preco:         item.preco_unitario ?? item.preco ?? null,
        preco_total:   item.preco_total ?? null,
        quantidade:    item.quantidade,
        categoria:     item.categoria     ?? null,
        nome_canonico: item.nome_canonico ?? null,
      }));

      const { error: erroItens } = await supabase
        .from('itens_compra')
        .insert(linhasItens);

      if (erroItens) throw erroItens;

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

// Retorna a média de gastos dos últimos 90 dias, ou null se menos de 3 compras.
// Considera SÓ compras de mercado (tipo='mercado'): incluir não-mercado
// (farmácia, posto, padaria de rua) derrubava a média e fazia o alerta disparar
// "acima do padrão" quase sempre (decisão 2026-06-07).
async function calcularMedia(phoneNumber) {
  try {
    const noventaDiasAtras = new Date();
    noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

    const { data, error } = await supabase
      .from('compras')
      .select('total')
      .eq('phone_number', phoneNumber)
      .eq('tipo', 'mercado')
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
      .select('id, total')
      .eq('phone_number', phoneNumber)
      .gte('data_compra', primeiroDia)
      .lt('data_compra', proximoMes);

    if (errC) throw errC;
    if (!compras || compras.length === 0) return [];

    const ids = compras.map(c => c.id);
    const totalCupons = compras.reduce((s, c) => s + (Number(c.total) || 0), 0);

    const { data: itens, error: errI } = await supabase
      .from('itens_compra')
      .select('categoria, preco, preco_total, quantidade')
      .in('compra_id', ids)
      .not('categoria', 'is', null);

    if (errI) throw errI;
    if (!itens || itens.length === 0) return [];

    // Agrega por categoria usando preco_total (fonte de verdade da linha).
    // Fallback para preco*quantidade só em linhas antigas sem preco_total.
    const catMap = {};
    let somaItens = 0;
    for (const item of itens) {
      const cat = item.categoria || 'outros';
      const valor = item.preco_total != null
        ? Number(item.preco_total) || 0
        : (Number(item.preco) || 0) * (Number(item.quantidade) || 1);
      catMap[cat] = (catMap[cat] || 0) + valor;
      somaItens += valor;
    }

    const categorias = Object.entries(catMap)
      .map(([categoria, total]) => ({ categoria, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);

    // Resíduo: diferença entre o total dos cupons (verdade) e a soma dos itens
    // categorizados. Vira a fatia "Não identificado" para o /gastos fechar com o
    // valor real gasto. Só entra se for relevante (> R$2 e > 2% do total).
    const residuo = Math.round((totalCupons - somaItens) * 100) / 100;
    const limiarResiduo = Math.max(2, totalCupons * 0.02);
    if (residuo > limiarResiduo) {
      categorias.push({ categoria: 'nao_identificado', total: residuo });
    } else if (residuo < -limiarResiduo) {
      // Itens somam mais que o total dos cupons — indica dupla contagem do Gemini.
      log('gastos_itens_excedem_total', {
        phone: maskPhone(phoneNumber), mes: mesReferencia,
        total_cupons: Math.round(totalCupons * 100) / 100,
        soma_itens: Math.round(somaItens * 100) / 100,
      });
    }

    return categorias;
  } catch (err) {
    log('supabase_erro', { fn: 'buscarGastosPorCategoria', erro: err.message });
    return [];
  }
}

// Retorna o "YYYY-MM" mais recente (por data_compra do cupom) que tem itens
// com categoria definida, ou null se não houver nenhum. Usado como fallback no
// /gastos quando o mês atual ainda não tem gastos categorizados.
async function buscarMesMaisRecenteComGastos(phoneNumber) {
  try {
    const { data: compras, error: errC } = await supabase
      .from('compras')
      .select('id, data_compra')
      .eq('phone_number', phoneNumber)
      .order('data_compra', { ascending: false });

    if (errC) throw errC;
    if (!compras || compras.length === 0) return null;

    const ids = compras.map(c => c.id);
    const { data: itens, error: errI } = await supabase
      .from('itens_compra')
      .select('compra_id')
      .in('compra_id', ids)
      .not('categoria', 'is', null);

    if (errI) throw errI;
    if (!itens || itens.length === 0) return null;

    const comCategoria = new Set(itens.map(i => i.compra_id));
    // compras já vem ordenado por data_compra desc → primeira com categoria define o mês
    const compraAlvo = compras.find(c => comCategoria.has(c.id));
    return compraAlvo?.data_compra ? compraAlvo.data_compra.slice(0, 7) : null;
  } catch (err) {
    log('supabase_erro', { fn: 'buscarMesMaisRecenteComGastos', erro: err.message });
    return null;
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
// Sistema de indicação (/convidar) — decisão CLAUDE.md 2026-06-07
// Programa de 2 lados e 2 marcos. Recompensa = dias de "features Pro"
// (comparativo + alerta inteligente), SEM mexer no limite de cupons.
// A janela vive em usuarios.features_pro_ate, separada de is_pro.
// ---------------------------------------------------------------

const INDICACAO_DIAS_ATIVACAO  = 7;   // marco 1: amigo manda o 1º cupom (os dois ganham)
const INDICACAO_DIAS_CONVERSAO = 30;  // marco 2: amigo vira Pro pagante (indicador ganha)
const INDICACAO_TETO_DIAS      = 60;  // teto de acúmulo de features Pro na conta
const DIA_MS = 24 * 60 * 60 * 1000;

// Alfabeto sem caracteres ambíguos (sem 0/O, 1/I/L)
const _ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function _gerarCodigoAleatorio(tamanho = 4) {
  const bytes = require('crypto').randomBytes(tamanho);
  let out = '';
  for (let i = 0; i < tamanho; i++) {
    out += _ALFABETO_CODIGO[bytes[i] % _ALFABETO_CODIGO.length];
  }
  return `CONV-${out}`;
}

// Retorna o código estável de indicação do usuário; cria no primeiro /convidar.
async function gerarCodigoIndicacao(phoneNumber) {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('codigo_indicacao')
      .eq('phone_number', phoneNumber)
      .single();
    if (error) throw error;
    if (usuario?.codigo_indicacao) return usuario.codigo_indicacao;

    // Tenta gerar um código único — em colisão (23505), tenta outro
    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const codigo = _gerarCodigoAleatorio(4);
      const { error: errUpd } = await supabase
        .from('usuarios')
        .update({ codigo_indicacao: codigo })
        .eq('phone_number', phoneNumber);
      if (!errUpd) return codigo;
      if (errUpd.code !== '23505') throw errUpd;
    }
    throw new Error('não foi possível gerar código único de indicação');
  } catch (err) {
    log('supabase_erro', { fn: 'gerarCodigoIndicacao', erro: err.message });
    throw err;
  }
}

// Registra indicação pendente no 1º contato do indicado.
// Guardas: código existe, não é auto-indicação, indicado ainda não foi indicado.
// Retorna { ok, motivo }. Nunca lança — é fire-and-forget no fluxo de onboarding.
async function registrarIndicacaoPendente(codigo, indicadoPhone) {
  try {
    const cod = (codigo || '').toUpperCase().trim();
    if (!cod) return { ok: false, motivo: 'codigo_vazio' };

    const { data: indicador, error } = await supabase
      .from('usuarios')
      .select('phone_number')
      .eq('codigo_indicacao', cod)
      .maybeSingle();
    if (error) throw error;
    if (!indicador) return { ok: false, motivo: 'codigo_inexistente' };
    if (indicador.phone_number === indicadoPhone) return { ok: false, motivo: 'auto_indicacao' };

    // UNIQUE(indicado_phone) garante 1 indicação por pessoa (o 1º vence)
    const { error: errIns } = await supabase
      .from('indicacoes')
      .insert({
        codigo: cod,
        indicador_phone: indicador.phone_number,
        indicado_phone: indicadoPhone,
        status: 'pendente',
      });

    if (errIns) {
      if (errIns.code === '23505') return { ok: false, motivo: 'ja_indicado' };
      throw errIns;
    }
    log('indicacao_registrada', {
      indicador: maskPhone(indicador.phone_number),
      indicado: maskPhone(indicadoPhone),
    });
    return { ok: true };
  } catch (err) {
    log('supabase_erro', { fn: 'registrarIndicacaoPendente', erro: err.message });
    return { ok: false, motivo: 'erro' };
  }
}

// Concede `dias` de features Pro, empilhando sobre a janela atual com teto de 60 dias.
// Retorna a nova data de expiração (ISO) ou null em erro.
async function concederFeaturesPro(phoneNumber, dias) {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('features_pro_ate')
      .eq('phone_number', phoneNumber)
      .single();
    if (error) throw error;

    const agora = Date.now();
    const atual = usuario?.features_pro_ate ? new Date(usuario.features_pro_ate).getTime() : 0;
    const base = Math.max(agora, atual);            // empilha sobre janela ativa, nunca encurta
    const alvo = base + dias * DIA_MS;
    const teto = agora + INDICACAO_TETO_DIAS * DIA_MS;
    const novaExpiracao = new Date(Math.min(alvo, teto)).toISOString();

    const { error: errUpd } = await supabase
      .from('usuarios')
      .update({ features_pro_ate: novaExpiracao })
      .eq('phone_number', phoneNumber);
    if (errUpd) throw errUpd;

    log('features_pro_concedidas', { phone: maskPhone(phoneNumber), dias, ate: novaExpiracao });
    return novaExpiracao;
  } catch (err) {
    log('supabase_erro', { fn: 'concederFeaturesPro', erro: err.message });
    return null;
  }
}

// Marco 1: indicado mandou o 1º cupom. Se houver indicação pendente, ativa e
// concede 7 dias de features Pro aos DOIS lados. Idempotente (pendente→ativado).
// Retorna { ativou, indicadorPhone, dias } — index.js usa pra notificar os dois.
async function ativarIndicacao(indicadoPhone) {
  try {
    const { data: indic, error } = await supabase
      .from('indicacoes')
      .select('id, indicador_phone, status')
      .eq('indicado_phone', indicadoPhone)
      .maybeSingle();
    if (error) throw error;
    if (!indic || indic.status !== 'pendente') return { ativou: false };

    // Flip condicional: só ativa se ainda pendente (guarda contra corrida de webhook)
    const { data: upd, error: errUpd } = await supabase
      .from('indicacoes')
      .update({ status: 'ativado', ativado_em: new Date().toISOString() })
      .eq('id', indic.id)
      .eq('status', 'pendente')
      .select('id');
    if (errUpd) throw errUpd;
    if (!upd || upd.length === 0) return { ativou: false }; // outra execução já ativou

    await Promise.all([
      concederFeaturesPro(indic.indicador_phone, INDICACAO_DIAS_ATIVACAO),
      concederFeaturesPro(indicadoPhone, INDICACAO_DIAS_ATIVACAO),
    ]);

    log('indicacao_ativada', {
      indicador: maskPhone(indic.indicador_phone),
      indicado: maskPhone(indicadoPhone),
    });
    return { ativou: true, indicadorPhone: indic.indicador_phone, dias: INDICACAO_DIAS_ATIVACAO };
  } catch (err) {
    log('supabase_erro', { fn: 'ativarIndicacao', erro: err.message });
    return { ativou: false };
  }
}

// Marco 2: indicado virou Pro pagante. Concede +30 dias de features Pro ao indicador.
// Cobre qualquer status != convertido (normalmente 'ativado', mas também o caso de
// pagar antes de mandar cupom). Idempotente. Retorna { converteu, indicadorPhone, dias }.
async function converterIndicacao(indicadoPhone) {
  try {
    const { data: indic, error } = await supabase
      .from('indicacoes')
      .select('id, indicador_phone, status')
      .eq('indicado_phone', indicadoPhone)
      .maybeSingle();
    if (error) throw error;
    if (!indic || indic.status === 'convertido') return { converteu: false };

    const { data: upd, error: errUpd } = await supabase
      .from('indicacoes')
      .update({ status: 'convertido', convertido_em: new Date().toISOString() })
      .eq('id', indic.id)
      .neq('status', 'convertido')
      .select('id');
    if (errUpd) throw errUpd;
    if (!upd || upd.length === 0) return { converteu: false };

    await concederFeaturesPro(indic.indicador_phone, INDICACAO_DIAS_CONVERSAO);
    log('indicacao_convertida', {
      indicador: maskPhone(indic.indicador_phone),
      indicado: maskPhone(indicadoPhone),
    });
    return { converteu: true, indicadorPhone: indic.indicador_phone, dias: INDICACAO_DIAS_CONVERSAO };
  } catch (err) {
    log('supabase_erro', { fn: 'converterIndicacao', erro: err.message });
    return { converteu: false };
  }
}

// Marca o usuário como Pro pagante (usado pelo endpoint admin de ativação manual).
async function marcarProAtivo(phoneNumber) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ is_pro: true })
      .eq('phone_number', phoneNumber);
    if (error) throw error;
    log('pro_ativado_manual', { phone: maskPhone(phoneNumber) });
  } catch (err) {
    log('supabase_erro', { fn: 'marcarProAtivo', erro: err.message });
    throw err;
  }
}

// Contagem de indicações do indicador, para exibir no /convidar.
async function buscarStatusIndicacoes(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('indicacoes')
      .select('status')
      .eq('indicador_phone', phoneNumber);
    if (error) throw error;

    const linhas = data || [];
    const ativados    = linhas.filter(r => r.status === 'ativado' || r.status === 'convertido').length;
    const convertidos = linhas.filter(r => r.status === 'convertido').length;
    return { total: linhas.length, ativados, convertidos };
  } catch (err) {
    log('supabase_erro', { fn: 'buscarStatusIndicacoes', erro: err.message });
    return { total: 0, ativados: 0, convertidos: 0 };
  }
}

// Helper puro: o usuário tem acesso às funções Pro? (assinante OU janela de recompensa ativa)
// Usar como gate de comparativo entre mercados + alerta inteligente QUANDO essas features
// forem implementadas. NÃO usar pro limite de cupons (decisão 2026-06-07).
function temFeaturesProAtivas(usuario) {
  if (!usuario) return false;
  if (usuario.is_pro) return true;
  if (!usuario.features_pro_ate) return false;
  return new Date(usuario.features_pro_ate).getTime() > Date.now();
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

// ---------------------------------------------------------------
// Assinaturas recorrentes (Mercado Pago)
// ---------------------------------------------------------------

// Marca o plano escolhido como "pendente de e-mail" — a próxima mensagem
// do usuário será interpretada como o e-mail da assinatura.
async function setPendentePlano(phoneNumber, plano) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ assinatura_pendente_plano: plano })
      .eq('phone_number', phoneNumber);
    if (error) throw error;
  } catch (err) {
    log('supabase_erro', { fn: 'setPendentePlano', erro: err.message });
    throw err;
  }
}

async function limparPendentePlano(phoneNumber) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ assinatura_pendente_plano: null })
      .eq('phone_number', phoneNumber);
    if (error) throw error;
  } catch (err) {
    log('supabase_erro', { fn: 'limparPendentePlano', erro: err.message });
    throw err;
  }
}

// Persiste a assinatura recém-criada (status inicial 'pending') e limpa o
// estado conversacional de "aguardando e-mail".
async function salvarAssinaturaPreapproval(phoneNumber, { preapprovalId, plano, email, status = 'pending' }) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        mp_preapproval_id: preapprovalId,
        plano,
        assinatura_email: email,
        assinatura_status: status,
        assinatura_pendente_plano: null,
        assinatura_atualizada_em: new Date().toISOString(),
      })
      .eq('phone_number', phoneNumber);
    if (error) throw error;
  } catch (err) {
    log('supabase_erro', { fn: 'salvarAssinaturaPreapproval', erro: err.message });
    throw err;
  }
}

// Atualiza o status da assinatura e liga/desliga is_pro de acordo.
// is_pro = TRUE apenas quando authorized. Retorna { statusAnterior, isProAnterior }.
async function atualizarStatusAssinatura(phoneNumber, status, extras = {}) {
  try {
    const { data: atual } = await supabase
      .from('usuarios')
      .select('assinatura_status, is_pro')
      .eq('phone_number', phoneNumber)
      .single();

    const isPro = status === 'authorized';
    const update = {
      assinatura_status: status,
      is_pro: isPro,
      assinatura_atualizada_em: new Date().toISOString(),
    };
    if (extras.preapprovalId) update.mp_preapproval_id = extras.preapprovalId;
    if (extras.plano) update.plano = extras.plano;

    const { error } = await supabase
      .from('usuarios')
      .update(update)
      .eq('phone_number', phoneNumber);
    if (error) throw error;

    log('assinatura_status_atualizado', {
      phone: maskPhone(phoneNumber),
      de: atual?.assinatura_status ?? null,
      para: status,
      is_pro: isPro,
    });

    return {
      statusAnterior: atual?.assinatura_status ?? null,
      isProAnterior: atual?.is_pro ?? false,
    };
  } catch (err) {
    log('supabase_erro', { fn: 'atualizarStatusAssinatura', erro: err.message });
    throw err;
  }
}

// Conciliação reversa: do preapproval_id (vindo no webhook) para o usuário.
async function buscarPorPreapprovalId(preapprovalId) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('phone_number, plano, assinatura_status, is_pro, mp_preapproval_id')
      .eq('mp_preapproval_id', preapprovalId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    log('supabase_erro', { fn: 'buscarPorPreapprovalId', erro: err.message });
    throw err;
  }
}

// Registra o evento de webhook. Retorna { ok, duplicado } — duplicado=true
// quando o mesmo (topico, recurso_id) já foi gravado (idempotência via índice
// único uq_assinatura_eventos_topico_recurso).
async function registrarEventoAssinatura({ phone = null, preapprovalId = null, topico, recursoId, acao = null, status = null, payload = null }) {
  try {
    const { error } = await supabase
      .from('assinatura_eventos')
      .insert({
        phone_number: phone,
        preapproval_id: preapprovalId,
        topico,
        recurso_id: String(recursoId),
        acao,
        status,
        payload,
      });

    if (error) {
      // 23505 = unique_violation → evento já processado
      if (error.code === '23505') return { ok: true, duplicado: true };
      throw error;
    }
    return { ok: true, duplicado: false };
  } catch (err) {
    log('supabase_erro', { fn: 'registrarEventoAssinatura', erro: err.message });
    return { ok: false, duplicado: false, error: err.message };
  }
}

// ---------------------------------------------------------------
// Idempotência do webhook Z-API (lei 5 do CODE_GUIDE)
// ---------------------------------------------------------------

// Registra o messageId do evento. Retorna { duplicado } — true quando o mesmo
// messageId já foi processado antes (reentrega do Z-API). A PK em message_id
// garante a atomicidade: em corrida de 2 entregas simultâneas, uma insere e a
// outra recebe 23505. Nunca lança — em erro inesperado, deixa processar (não
// bloquear o usuário por uma falha de dedup), mas loga.
async function registrarMensagemProcessada(messageId, phoneNumber, tipo) {
  try {
    const { error } = await supabase
      .from('mensagens_processadas')
      .insert({ message_id: messageId, phone_number: phoneNumber, tipo });

    if (error) {
      if (error.code === '23505') return { duplicado: true };  // já processado
      throw error;
    }
    return { duplicado: false };
  } catch (err) {
    log('supabase_erro', { fn: 'registrarMensagemProcessada', erro: err.message });
    // Falha de dedup não pode travar o atendimento — segue como não-duplicado.
    return { duplicado: false };
  }
}

// Purga registros de dedup com mais de `dias` dias. Chamada por cron diário.
// A janela só precisa cobrir o intervalo de reentrega do Z-API (minutos/horas);
// 7 dias é folga de sobra e mantém a tabela pequena.
async function purgarMensagensProcessadas(dias = 7) {
  try {
    const corte = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('mensagens_processadas')
      .delete()
      .lt('criado_em', corte);
    if (error) throw error;
    log('mensagens_processadas_purgadas', { antes_de: corte });
  } catch (err) {
    log('supabase_erro', { fn: 'purgarMensagensProcessadas', erro: err.message });
  }
}

// Dados da assinatura do usuário — usado em /cancelar-assinatura e status.
async function buscarDadosAssinatura(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('mp_preapproval_id, plano, assinatura_status, assinatura_email, is_pro')
      .eq('phone_number', phoneNumber)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    log('supabase_erro', { fn: 'buscarDadosAssinatura', erro: err.message });
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
  buscarMesMaisRecenteComGastos,
  setOptOutPrecos,
  buscarElegiveisOnboarding,
  buscarElegiveisInativos,
  buscarElegiveisLimiteAviso,
  buscarElegiveisFinsDeMes,
  lembreteFoiEnviado,
  registrarLembreteEnviado,
  gerarCodigoIndicacao,
  registrarIndicacaoPendente,
  concederFeaturesPro,
  ativarIndicacao,
  converterIndicacao,
  marcarProAtivo,
  buscarStatusIndicacoes,
  temFeaturesProAtivas,
  setPendentePlano,
  limparPendentePlano,
  salvarAssinaturaPreapproval,
  atualizarStatusAssinatura,
  buscarPorPreapprovalId,
  registrarEventoAssinatura,
  buscarDadosAssinatura,
  registrarMensagemProcessada,
  purgarMensagensProcessadas,
};
