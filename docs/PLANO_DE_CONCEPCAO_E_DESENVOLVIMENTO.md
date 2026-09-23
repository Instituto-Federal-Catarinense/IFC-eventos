# Plano de Concepção e Desenvolvimento — IFC-Eventos

Este documento detalha o plano de desenvolvimento e validação do artefato tecnológico **IFC-Eventos**, estruturado segundo o método **Design Science Research (DSR)**, compreendendo os ciclos de construção, avaliação com a norma **ISO/IEC 25010** e implantação do evento-piloto.

---

## 1. Definição da Stack Tecnológica

- **Backend**: **NestJS (TypeScript)**
  - Arquitetura modular, injeção de dependências, validação estrita com `class-validator`, documentação interativa de endpoints com Swagger/OpenAPI.
- **Frontend**: **Next.js (React 19 / App Router / TypeScript)**
  - Renderização híbrida (SSR/SSG/Client Components), Tailwind CSS e biblioteca de componentes acessíveis baseada no **shadcn/ui**.
- **Camada de Dados & Persistência**: **PostgreSQL** com **Prisma ORM**
  - Modelagem relacional tipada, migrações automatizadas e suporte a queries transacionais.
- **Armazenamento de Arquivos**: Armazenamento em disco com abstração para S3/MinIO (submissões de artigos e certificados PDF).
- **Ambiente de Execução**: **Docker** e **Docker Compose** para orquestração de serviços e facilidade de implantação na infraestrutura do IFC.

---

## 2. Estrutura do Repositório (Monorepo)

```text
IFC-eventos/
├── apps/
│   ├── api/                     # Backend NestJS (REST API, Swagger, Prisma/PostgreSQL)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/        # Autenticação própria (JWT/Passport) + interface extensível (SUAP)
│   │   │   │   ├── users/       # Gestão de usuários, perfis e consentimento LGPD
│   │   │   │   ├── campuses/    # Gestão de campi do IFC e comissões locais
│   │   │   │   ├── events/      # Criação e gestão de eventos e lotes gratuitos
│   │   │   │   ├── submissions/ # Submissão de trabalhos científicos, trilhas e arquivos
│   │   │   │   ├── reviews/     # Distribuição cega e avaliação de artigos
│   │   │   │   ├── activities/  # Minicursos, oficinas, palestras e vagas
│   │   │   │   ├── checkin/     # Credenciamento e presença via QR Code
│   │   │   │   ├── certificates/# Geração de PDF e validação pública de autenticidade (hash SHA-256)
│   │   │   │   └── statistics/  # Métricas para comissões e pró-reitorias
│   │   │   ├── common/          # Guards RBAC, interceptors, decorators, filtros de erro
│   │   │   └── prisma/          # Esquema relacional, migrações e seed institucional
│   └── web/                     # Frontend Next.js (App Router, Tailwind CSS, shadcn/ui)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/      # Login, cadastro de participantes, recuperação de senha
│       │   │   ├── (public)/    # Portal público de eventos, detalhes, inscrição e validação de certificados
│       │   │   ├── (dashboard)/ # Painel do participante (ingressos, submissões, certificados)
│       │   │   └── (admin)/     # Painel de gestão (Organizadores, Gestores de Campus, Avaliadores)
│       │   ├── components/      # Componentes UI reutilizáveis (acessíveis e responsivos)
│       │   └── lib/             # Cliente de API tipado, utilitários de autenticação e validação
├── packages/
│   └── shared-types/            # Tipagens e enums compartilhados entre backend e frontend
├── docs/                        # Documentação técnica e científica do projeto
│   ├── ARQUITETURA.md
│   └── PLANO_DE_CONCEPCAO_E_DESENVOLVIMENTO.md
├── docker-compose.yml           # Serviços auxiliares de desenvolvimento (PostgreSQL e Redis)
└── README.md
```

---

## 3. Modelo de Dados Relacional (Entidades Centrais)

1. **Campus**:
   - `id`, `nome`, `sigla`, `cidade`, `ativo`, `createdAt`, `updatedAt`
2. **User**:
   - `id`, `campusId` (opcional), `nome`, `email`, `cpf_hash`, `senha`, `papel` (`ADMIN_GERAL`, `GESTOR_CAMPUS`, `ORGANIZADOR`, `AVALIADOR`, `PARTICIPANTE`), `consentimentoLgpdEm`, `termosVersao`, `createdAt`
3. **Event**:
   - `id`, `campusId`, `titulo`, `slug`, `descricao`, `dataInicio`, `dataFim`, `localizacao`, `formato` (`PRESENCIAL`, `REMOTO`, `HIBRIDO`), `status` (`RASCUNHO`, `PUBLICADO`, `ENCERRADO`), `limiteVagas`
4. **Activity**:
   - `id`, `eventId`, `titulo`, `tipo` (`PALESTRA`, `MINICURSO`, `MESA_REDONDA`, `OFICINA`, `SESSAO_POSTER`), `vagasMax`, `dataHoraInicio`, `dataHoraFim`, `local`, `ministrantes`
5. **Registration (Inscrição no Evento)**:
   - `id`, `eventId`, `userId`, `qrCodeToken`, `status` (`CONFIRMADA`, `CANCELADA`), `presenteGeral`, `credenciadoEm`
6. **ActivityEnrollment (Inscrição em Atividade)**:
   - `id`, `activityId`, `registrationId`, `presente`, `checkinEm`
7. **Track (Trilha Científica)**:
   - `id`, `eventId`, `nome`, `descricao`, `coordenadorId`
8. **Submission (Submissão Científica)**:
   - `id`, `trackId`, `eventId`, `autorPrincipalId`, `titulo`, `resumo`, `palavrasChave`, `arquivoPdfPath`, `arquivoAnonimizadoPdfPath`, `status` (`SUBMETIDO`, `EM_AVALIACAO`, `APROVADO`, `APROVADO_COM_RESSALVAS`, `REJEITADO`)
9. **Review (Avaliação de Artigo)**:
   - `id`, `submissionId`, `reviewerId`, `notaOriginalidade`, `notaMetodologia`, `notaRelevancia`, `notaRedacao`, `parecerConsolidado`, `recomendacao` (`APROVAR`, `APROVAR_RESSALVAS`, `REJEITAR`), `avaliadoEm`
10. **Certificate**:
    - `id`, `userId`, `eventId`, `activityId` (opcional), `tipo` (`PARTICIPACAO_EVENTO`, `MINICURSO`, `APRESENTACAO_TRABALHO`, `AVALIADOR`, `COMISSAO_ORGANIZADORA`), `codigoValidacao` (Hash SHA-256), `cargaHoraria`, `emitidoEm`

---

## 4. Fases de Execução e Ciclos DSR

### **Ciclo 1: Fundação do Artefato e Infraestrutura Base**
- Estruturação do monorepo e padronização com ESLint, Prettier e TypeScript.
- Configuração do `docker-compose.yml` para banco de dados PostgreSQL.
- Criação do schema Prisma inicial, migrações e seed dos 15 campi do IFC.
- Implementação da camada de autenticação extensível (estratégia local + interface aberta para SUAP/OAuth2).
- Controle de acesso baseado em papéis (RBAC com Guards NestJS).

### **Ciclo 2: Gestão de Eventos, Atividades e Inscrições Gratuitas**
- Criação e administração de eventos por organizadores e gestores de campus.
- Cadastro de atividades (palestras, oficinas, minicursos com limite de vagas).
- Portal público de eventos: catálogo, página do evento e programação completa.
- Fluxo de inscrição direta e gratuita com consentimento de termos LGPD.
- Geração de credencial digital com token QR Code assinado criptograficamente.

### **Ciclo 3: Credenciamento e Check-in em Tempo Real**
- Interface de credenciamento otimizada para dispositivos móveis com scanner de QR Code.
- Registro instantâneo de presença geral e de presença por atividade.
- Mecanismo de contingência para credenciamento por consulta nominal ou CPF.

### **Ciclo 4: Submissão e Avaliação Científica**
- Parametrização de editais, prazos e áreas temáticas.
- Submissão de trabalhos com envio de PDF com e sem identificação de autores (*blind review*).
- Painel da comissão científica para alocação de pareceristas.
- Área do avaliador para análise e preenchimento de ficha avaliativa com critérios objetivos e notas.
- Publicação de resultados aos autores.

### **Ciclo 5: Certificação Digital & Validação Pública**
- Mecanismo automatizado de cálculo de frequência e elegibilidade.
- Geração de certificados em PDF com leiaute institucional do IFC.
- Aplicação de código hash SHA-256 e QR Code apontando para rota pública de autenticidade.
- Página pública de consulta e verificação instantânea de certificados.

### **Ciclo 6: Avaliação de Qualidade (ISO/IEC 25010) e Evento-Piloto**
- **Adequação Funcional**:
  - Testes unitários e de integração automatizados em todos os módulos centrais.
- **Usabilidade**:
  - Avaliação de conformidade com padrões de acessibilidade (WCAG 2.1 / e-MAG) e responsividade.
- **Eficiência de Desempenho**:
  - Execução de testes de carga simulando picos de credenciamento e inscrições concorrentes.
- **Execução do Evento-Piloto**:
  - Validação técnica do artefato em ambiente controlado sem sujeitos humanos como objeto de pesquisa.
