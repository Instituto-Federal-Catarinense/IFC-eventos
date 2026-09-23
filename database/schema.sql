CREATE TABLE campus (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  sigla VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE evento (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  campus_id BIGINT NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descricao TEXT,
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME,
  local VARCHAR(160),
  status ENUM('planejado', 'aberto', 'encerrado') NOT NULL DEFAULT 'planejado',
  FOREIGN KEY (campus_id) REFERENCES campus(id)
);

CREATE TABLE inscricao (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evento_id BIGINT NOT NULL,
  participante_nome VARCHAR(180) NOT NULL,
  participante_email VARCHAR(180) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inscricao_evento_email (evento_id, participante_email),
  FOREIGN KEY (evento_id) REFERENCES evento(id)
);

CREATE TABLE avaliador (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  area VARCHAR(120) NOT NULL
);

CREATE TABLE submissao (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evento_id BIGINT NOT NULL,
  titulo VARCHAR(220) NOT NULL,
  resumo TEXT,
  autor_principal VARCHAR(180) NOT NULL,
  status ENUM('pendente', 'aprovado', 'reprovado') NOT NULL DEFAULT 'pendente',
  FOREIGN KEY (evento_id) REFERENCES evento(id)
);

CREATE TABLE avaliacao_trabalho (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  submissao_id BIGINT NOT NULL,
  avaliador_id BIGINT NOT NULL,
  nota DECIMAL(4,2) NOT NULL,
  parecer TEXT,
  FOREIGN KEY (submissao_id) REFERENCES submissao(id),
  FOREIGN KEY (avaliador_id) REFERENCES avaliador(id)
);

CREATE TABLE atividade (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evento_id BIGINT NOT NULL,
  tipo ENUM('minicurso', 'palestra') NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descricao TEXT,
  vagas INT,
  FOREIGN KEY (evento_id) REFERENCES evento(id)
);

CREATE TABLE checkin (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  inscricao_id BIGINT NOT NULL,
  data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inscricao_id) REFERENCES inscricao(id)
);

CREATE TABLE certificado (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  inscricao_id BIGINT NOT NULL,
  codigo_validacao VARCHAR(80) NOT NULL UNIQUE,
  carga_horaria INT NOT NULL,
  emitido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inscricao_id) REFERENCES inscricao(id)
);

CREATE TABLE transacao_financeira (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evento_id BIGINT NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  descricao VARCHAR(200),
  valor DECIMAL(12,2) NOT NULL,
  data_lancamento DATE NOT NULL,
  FOREIGN KEY (evento_id) REFERENCES evento(id)
);
