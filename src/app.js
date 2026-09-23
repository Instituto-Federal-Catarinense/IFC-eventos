const express = require('express');

function createStore() {
  return {
    eventos: [],
    inscricoes: [],
    submissoes: [],
    avaliadores: [],
    atividades: [],
    checkins: [],
    certificados: [],
    transacoes: [],
    lastId: 0,
  };
}

function nextId(store) {
  store.lastId += 1;
  return store.lastId;
}

function createApp(store = createStore()) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/eventos', (_req, res) => {
    res.json(store.eventos);
  });

  app.post('/api/eventos', (req, res) => {
    const { titulo, campus, inicio } = req.body;
    if (!titulo || !campus || !inicio) {
      return res.status(400).json({ error: 'titulo, campus e inicio são obrigatórios' });
    }

    const evento = {
      id: nextId(store),
      titulo,
      campus,
      inicio,
      fim: req.body.fim || null,
      descricao: req.body.descricao || null,
      createdAt: new Date().toISOString(),
    };

    store.eventos.push(evento);
    return res.status(201).json(evento);
  });

  app.get('/api/inscricoes', (_req, res) => {
    res.json(store.inscricoes);
  });

  app.post('/api/inscricoes', (req, res) => {
    const { eventoId, participante } = req.body;
    if (!eventoId || !participante) {
      return res.status(400).json({ error: 'eventoId e participante são obrigatórios' });
    }

    const inscricao = {
      id: nextId(store),
      eventoId,
      participante,
      createdAt: new Date().toISOString(),
    };

    store.inscricoes.push(inscricao);
    return res.status(201).json(inscricao);
  });

  app.get('/api/submissoes', (_req, res) => {
    res.json(store.submissoes);
  });

  app.post('/api/submissoes', (req, res) => {
    const { eventoId, titulo, autorPrincipal } = req.body;
    if (!eventoId || !titulo || !autorPrincipal) {
      return res.status(400).json({ error: 'eventoId, titulo e autorPrincipal são obrigatórios' });
    }

    const submissao = {
      id: nextId(store),
      eventoId,
      titulo,
      autorPrincipal,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    store.submissoes.push(submissao);
    return res.status(201).json(submissao);
  });

  app.get('/api/avaliadores', (_req, res) => {
    res.json(store.avaliadores);
  });

  app.post('/api/avaliadores', (req, res) => {
    const { nome, email, area } = req.body;
    if (!nome || !email || !area) {
      return res.status(400).json({ error: 'nome, email e area são obrigatórios' });
    }

    const avaliador = { id: nextId(store), nome, email, area };
    store.avaliadores.push(avaliador);
    return res.status(201).json(avaliador);
  });

  app.get('/api/atividades', (_req, res) => {
    res.json(store.atividades);
  });

  app.post('/api/atividades', (req, res) => {
    const { eventoId, tipo, titulo } = req.body;
    if (!eventoId || !tipo || !titulo) {
      return res.status(400).json({ error: 'eventoId, tipo e titulo são obrigatórios' });
    }

    if (!['minicurso', 'palestra'].includes(tipo)) {
      return res.status(400).json({ error: 'tipo deve ser minicurso ou palestra' });
    }

    const atividade = { id: nextId(store), eventoId, tipo, titulo };
    store.atividades.push(atividade);
    return res.status(201).json(atividade);
  });

  app.get('/api/checkins', (_req, res) => {
    res.json(store.checkins);
  });

  app.post('/api/checkins', (req, res) => {
    const { inscricaoId } = req.body;
    if (!inscricaoId) {
      return res.status(400).json({ error: 'inscricaoId é obrigatório' });
    }

    const checkin = { id: nextId(store), inscricaoId, timestamp: new Date().toISOString() };
    store.checkins.push(checkin);
    return res.status(201).json(checkin);
  });

  app.get('/api/certificados', (_req, res) => {
    res.json(store.certificados);
  });

  app.post('/api/certificados', (req, res) => {
    const { participante, eventoId, cargaHoraria } = req.body;
    if (!participante || !eventoId || !cargaHoraria) {
      return res.status(400).json({ error: 'participante, eventoId e cargaHoraria são obrigatórios' });
    }

    const certificado = {
      id: nextId(store),
      participante,
      eventoId,
      cargaHoraria,
      codigo: `IFC-${Date.now()}-${store.lastId}`,
    };

    store.certificados.push(certificado);
    return res.status(201).json(certificado);
  });

  app.get('/api/financeiro/transacoes', (_req, res) => {
    res.json(store.transacoes);
  });

  app.post('/api/financeiro/transacoes', (req, res) => {
    const { eventoId, tipo, valor } = req.body;
    if (!eventoId || !tipo || typeof valor !== 'number') {
      return res.status(400).json({ error: 'eventoId, tipo e valor numérico são obrigatórios' });
    }

    if (!['receita', 'despesa'].includes(tipo)) {
      return res.status(400).json({ error: 'tipo deve ser receita ou despesa' });
    }

    const transacao = { id: nextId(store), eventoId, tipo, valor };
    store.transacoes.push(transacao);
    return res.status(201).json(transacao);
  });

  app.get('/api/dashboard/resumo', (_req, res) => {
    const receitas = store.transacoes
      .filter((item) => item.tipo === 'receita')
      .reduce((acc, item) => acc + item.valor, 0);
    const despesas = store.transacoes
      .filter((item) => item.tipo === 'despesa')
      .reduce((acc, item) => acc + item.valor, 0);

    res.json({
      eventos: store.eventos.length,
      inscricoes: store.inscricoes.length,
      submissoes: store.submissoes.length,
      participantes: new Set(store.inscricoes.map((i) => i.participante)).size,
      saldoFinanceiro: receitas - despesas,
    });
  });

  return app;
}

module.exports = { createApp, createStore };
