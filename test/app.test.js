const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { createApp, createStore } = require('../src/app');

async function withServer(run) {
  const app = createApp(createStore());
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await run(port);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('healthcheck responde ok', async () => {
  await withServer(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'ok');
  });
});

test('cria evento e retorna no dashboard', async () => {
  await withServer(async (port) => {
    const createEvent = await fetch(`http://127.0.0.1:${port}/api/eventos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ titulo: 'Semana de Ciência', campus: 'Blumenau', inicio: '2026-10-20' }),
    });

    assert.equal(createEvent.status, 201);

    const summaryResponse = await fetch(`http://127.0.0.1:${port}/api/dashboard/resumo`);
    assert.equal(summaryResponse.status, 200);

    const summary = await summaryResponse.json();
    assert.equal(summary.eventos, 1);
    assert.equal(summary.inscricoes, 0);
  });
});

test('valida tipo de atividade', async () => {
  await withServer(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/atividades`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventoId: 1, tipo: 'oficina', titulo: 'Atividade inválida' }),
    });

    assert.equal(response.status, 400);
  });
});
