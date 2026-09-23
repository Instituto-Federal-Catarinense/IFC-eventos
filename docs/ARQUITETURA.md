# Visão Arquitetural e Requisitos do Artefato — IFC-Eventos

Este documento estabelece a fundamentação arquitetural, os princípios de engenharia de software e os requisitos funcionais e não funcionais do sistema **IFC-Eventos**, alinhados à abordagem metodológica de **Design Science Research (DSR)** e aos atributos de qualidade da norma **ISO/IEC 25010**.

---

## 1. Contexto e Motivação do Artefato

A gestão de eventos acadêmico-científicos no Instituto Federal Catarinense (IFC) é historicamente caracterizada pela fragmentação operacional:
- Uso de formulários avulsos (como Google Forms) sem integração sistêmica;
- Dependência de plataformas comerciais terceirizadas (como Even3), gerando custos recorrentes e dispersão de dados institucionais;
- Ausência de controle institucional unificado sobre dados pessoais, demandando estrita conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**;
- Necessidade de garantia de soberania tecnológica e de dados institucionais.

O **IFC-Eventos** é concebido como um artefato tecnológico web, multicampi, de ponta a ponta, integrando todo o ciclo de vida dos eventos científicos da instituição.

---

## 2. Princípios Arquiteturais e Diretrizes Técnicas

### 2.1. Soberania de Dados e Conformidade LGPD por Design (*Privacy by Design*)
- **Minimização de Dados**: Coleta restrita aos campos estritamente necessários para inscrição, credenciamento e emissão de certificados acadêmicos.
- **Gestão de Consentimento**: Termo de consentimento explícito e versionado no ato de criação de conta e inscrição.
- **Segurança e Criptografia**: Dados sensíveis (como senhas e identificadores únicos) tratados com algoritmos criptográficos robustos e hashes seguros.
- **Transparência e Direitos do Titular**: Endpoints e relatórios para consulta e requisição de dados pessoais.

### 2.2. Arquitetura Multicampi e Multi-inquilino (*Multi-tenancy Lógico*)
- O sistema organiza os eventos e comissões por **Campus** do IFC, permitindo que cada unidade administre seus próprios eventos com autonomia, mantendo visibilidade unificada pela Pró-Reitoria / Reitoria.
- Modelo de dados relacional com particionamento lógico via chave de campus (`campusId`) e suporte a eventos multicampi ou de abrangência institucional global.

### 2.3. Autenticação Extensível (Padrão Strategy)
- Camada nativa com JWT seguro (Access Token stateless e Refresh Token em cookies `HttpOnly`).
- Arquitetura desacoplada via interfaces/provedores de autenticação, viabilizando integração futura e transparente com o **SUAP** (Sistema Unificado de Administração Pública do IFC) via OAuth2/OIDC.

### 2.4. Modelo de Eventos 100% Gratuitos
- Ciclo de inscrição simplificado e desimpedido de taxas financeiras para os participantes, mantendo o controle rigoroso de lotes de inscrição, limites de vagas e listas de espera.

---

## 3. Módulos Funcionais do Artefato

### 3.1. Núcleo Institucional e Multicampi
- Cadastro e parametrização dos campi do IFC.
- Controle de acesso baseado em papéis (**RBAC**): Administrador Geral, Gestor de Campus, Organizador de Evento, Avaliador/Parecerista e Participante.
- Gestão de comissões organizadoras e comissões científicas locais.

### 3.2. Gestão do Ciclo de Eventos e Inscrições
- Criação e configuração de eventos (título, descrição, datas, local, formato: presencial, híbrido ou remoto).
- Definição de lotes de inscrição gratuitos, limites de vagas e prazos.
- Formulário dinâmico de inscrição com aceite LGPD.
- Emissão de comprovante de inscrição e credencial com QR Code assinado criptograficamente.

### 3.3. Submissão e Avaliação de Trabalhos Científicos
- Configuração de editais de submissão, trilhas temáticas e prazos de envio.
- Submissão de trabalhos (resumos e artigos completos em formato PDF).
- Suporte a avaliação às cegas (*single-blind* e *double-blind*), com armazenamento de versões anonimizadas.
- Distribuição de artigos para avaliadores (manual ou automatizada por trilha).
- Formulário padronizado de avaliação com critérios e notas objetivas, emissão de pareceres e consolidação de resultados (Aprovado, Aprovado com Ressalvas, Rejeitado).

### 3.4. Gestão de Atividades e Programação
- Cadastro da programação do evento (palestras, minicursos, mesas-redondas, oficinas, sessões de pôsteres).
- Gestão de vagas por atividade com controle de concorrência e restrições de choques de horário.
- Inscrição individualizada em atividades satélites.

### 3.5. Credenciamento e Check-in em Tempo Real
- Módulo de leitura de QR Code via navegador/câmera de dispositivos móveis.
- Validação rápida de entrada no evento principal e em atividades específicas.
- Mecanismo alternativo de credenciamento por busca nominal ou CPF para situações de contingência.

### 3.6. Emissão e Verificação Pública de Certificados
- Geração de certificados em PDF com leiaute institucional do IFC.
- Regra de presença mínima configurável (ex.: 75% de frequência nas atividades registradas).
- Emissão para múltiplos papéis: Participante, Palestrante, Ministrante de Minicurso, Autor de Trabalho e Membro de Comissão.
- Inserção de código de autenticação unívoco (Hash SHA-256) e QR Code de verificação pública no certificado.
- Rota pública para validação de autenticidade acessível a qualquer interessado.

### 3.7. Painéis Estatísticos e Relatórios
- Indicadores de inscritos vs. presentes (taxa de *no-show*).
- Distribuição de participantes por campus, curso e categoria acadêmica.
- Relatórios científicos: trabalhos submetidos, aprovados e índice de pareceres emitidos.

---

## 4. Requisitos Não Funcionais (Baseados na ISO/IEC 25010)

1. **Adequação Funcional (Functional Suitability)**:
   - Cobertura completa de requisitos do ciclo de vida do evento científico, com validação de dados em todas as camadas de entrada (DTOs com validação estrita).
2. **Usabilidade (Usability)**:
   - Interface limpa, responsiva (mobile-first para credenciamento) e aderente às diretrizes de acessibilidade na web (e-MAG / WCAG 2.1).
3. **Eficiência de Desempenho (Performance Efficiency)**:
   - Tempo de resposta sub-segundo para rotas de check-in e validação de certificados.
   - Otimização de consultas relacionais e suporte a processamento assíncrono para geração de lotes de certificados.
4. **Confiabilidade e Integridade (Reliability)**:
   - Integridade transacional nos fluxos concorrentes de inscrição e ocupação de vagas de atividades.
5. **Segurança (Security)**:
   - Proteção contra as vulnerabilidades do OWASP Top 10 (injeção de SQL, XSS, CSRF, quebra de autenticação).
   - Armazenamento seguro de senhas com hashing bcrypt ou argon2.
6. **Manutenibilidade (Maintainability)**:
   - Separação de responsabilidades em arquitetura modular, código fortemente tipado em TypeScript, injeção de dependências e documentação de APIs via Swagger/OpenAPI.
