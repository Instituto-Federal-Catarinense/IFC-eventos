# IFC-eventos

Sistema web institucional multicampi para gestão integrada de eventos acadêmico-científicos do IFC.

## Escopo implementado nesta base

Esta base entrega um **MVP backend Node.js** com endpoints para os módulos essenciais do domínio e um **modelo relacional MySQL** para evolução em produção:

- inscrições
- submissão e avaliação de trabalhos
- cadastro de avaliadores
- minicursos e palestras
- check-in e controle de presença
- emissão de certificados
- gestão financeira do evento
- dashboard estatístico

## Stack

- Node.js + Express
- MySQL (modelo em `/database/schema.sql`)
- Ambiente Linux

## Estrutura

- `/src/app.js`: API HTTP dos módulos
- `/src/server.js`: bootstrap do servidor
- `/database/schema.sql`: modelo relacional inicial
- `/test/app.test.js`: testes de fumaça e regras mínimas

## Executar localmente

```bash
npm install
npm test
npm start
```

## Endpoints principais

- `GET /health`
- `GET/POST /api/eventos`
- `GET/POST /api/inscricoes`
- `GET/POST /api/submissoes`
- `GET/POST /api/avaliadores`
- `GET/POST /api/atividades`
- `GET/POST /api/checkins`
- `GET/POST /api/certificados`
- `GET/POST /api/financeiro/transacoes`
- `GET /api/dashboard/resumo`
