CREATE DATABASE zelossitesenai;
USE zelossitesenai;

-- Tabela de usuários
CREATE TABLE usuarios (

    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL, -- aqui vai o hash da senha
    email VARCHAR(255) NOT NULL UNIQUE,
    funcao ENUM('Administrador','Técnico','Usuário') NOT NULL,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de pools
CREATE TABLE pool (

    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo ENUM('externo','manutencao','apoio_tecnico','limpeza') NOT NULL,
    descricao TEXT,
    status ENUM('ativo','inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    FOREIGN KEY (updated_by) REFERENCES usuarios(id)
);

-- Tabela de chamados
CREATE TABLE chamados (

    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_id INT,
    tecnico_id INT,
    usuario_id INT,
    status ENUM('pendente','em andamento','concluído') DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_id) REFERENCES pool(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de apontamentos
CREATE TABLE apontamentos (

    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id INT,
    tecnico_id INT,
    descricao TEXT,
    comeco TIMESTAMP NOT NULL,
    fimatendimento TIMESTAMP NULL,
    duracao INT AS (TIMESTAMPDIFF(SECOND, comeco, fimatendimento)) STORED,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

-- Tabela de relacionamento técnico <-> pool
CREATE TABLE pool_tecnico (

    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pool INT,
    id_tecnico INT,
    FOREIGN KEY (id_pool) REFERENCES pool(id),
    FOREIGN KEY (id_tecnico) REFERENCES usuarios(id)
);

-- Histórico de chamados
CREATE TABLE historico_chamados (

    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id INT NOT NULL,
    acao VARCHAR(255),
    usuario_id INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

-- Índices para otimização
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_chamados_status ON chamados(status);
CREATE INDEX idx_apontamentos_comeco_fim ON apontamentos(comeco,fimatendimento);

-- Inserir usuários (senhas são placeholders, substitua por hash real)
INSERT INTO usuarios (nome, senha, email, funcao, status) VALUES
('Nicolas de Lima', '$2b$12$LFaOrtNxBWEzdrfpuAcMH.EcjQif9B1uVBLz7wGvp2z7XO7/WIUQ.', 'nicolas@administradorsenai.com', 'Administrador', 'ativo'),
('Pedro Vasconcelos', '$2b$12$6bTI/22YqRfGabMdd6qyuOb.gWrDvHzjVTcqhroFivJhqKYWJaCAS', 'pedro@administradorsenai.com', 'Administrador', 'ativo'),
('Sara Limeira', '$2b$12$l668PEnyQE8TJ1WutebiH.gWRj2gje8R1pXEJrDYNP7w5hWNaoJ9q', 'sara@administradorsenai.com', 'Administrador', 'inativo'),
('Felipe Casaquera', '$2b$12$aG.iiXXDIn4.1wgVf3nUuOGmSmH58PdUEe3RK2l6RH64xLjBToZvq', 'felipe@administradorsenai.com', 'Administrador', 'inativo'),
('João Carvalho', '$2b$12$4RvAjmhfSuTmgN76LBQViOq.QhAA91dh92g4y5dkqJ.82B9OsXtf2', 'joao@tecnicosenai.com', 'Técnico', 'ativo'),
('Fernando Manhasi', '$2b$12$c5wvfv3TzB9MxwY6q0eaMedEsmvXzwhZfU4AnclfkZPCUI2ioE7OW', 'fernando@tecnicosenai.com', 'Técnico', 'ativo'),
('Ricardo Espanha', '$2b$12$c5wvfv3TzB9MxwY6q0eaMedEsmvXzwhZfU4AnclfkZPCUI2ioE7OW', 'ricardo@tecnicosenai.com', 'Técnico', 'ativo'),
('Nicoli Castilho', '$2b$12$R0NkA0zz.fokCxG35q2I6uNXqqpX0l26oc/ItXXOK5U0BVCC9CycS', 'nicoli@tecnicosenai.com', 'Técnico', 'inativo'),
('Carlos Ferreira', '$2b$12$R6KjcGkfGa5tmCgaJMGnruTrWXPypN6o9ZZnZYkqWyA.GcF/LDwka', 'carlos@senaisp.com', 'Usuário', 'ativo'),
('Bruno Leite Farias', '$2b$12$faqtkAR2dSgfjYiKXKg4Ue1HKWiDJUVmDLaW1xtN6PIzklYiZaSke', 'bruno@senaisp.com', 'Usuário', 'ativo'),
('Gabriele Oliveira', '$2b$12$.D7ZzDk4ZJaXjf.5Oxmyg.0gRMpsJSRVeuLcwbef.kPI3ZvFTS0Vm', 'gabi@senaisp.com', 'Usuário', 'inativo'),
('Pedro Camões', '$2b$12$zpcpVfzmc0gmKmTO/FaMNueDUXGDeuK3UHEI8vOyfG2VNb3AbD5li', 'pedro@senaisp.com', 'Usuário', 'inativo');

-- Inserir pools
INSERT INTO pool (titulo, descricao, created_by, updated_by) VALUES 
('apoio_tecnico','Suporte em tecnologia da informação',1,1),
('manutencao','Manutenção predial',1,1),
('externo','Atendimentos fora da empresa, como visitas técnicas.',1,1),
('limpeza','Solicitações relacionadas à limpeza e higienização',1,1);

-- Inserir chamados
INSERT INTO chamados (titulo, descricao, tipo_id, tecnico_id, usuario_id, status) VALUES
('Problema com computador','O computador não liga mais após queda de energia.',1,2,1,'pendente'),
('Atualização de software','Necessário atualizar o antivírus em todas as máquinas.',1,3,3,'em andamento'),
('Troca de lâmpada','A lâmpada da sala 204 queimou.',2,1,2,'pendente'),
('Ar-condicionado com defeito','Ar-condicionado da recepção está sem funcionar.',2,2,3,'em andamento'),
('Instalação de impressora','Precisa instalar uma nova impressora no setor de RH.',1,1,4,'concluído'),
('Vazamento no banheiro','Banheiro masculino com vazamento no cano.',2,2,2,'pendente'),
('Erro no sistema interno','Sistema está travando na autenticação.',1,3,1,'pendente'),
('Solicitação de limpeza','Precisa de limpeza urgente na sala de reuniões.',4,NULL,2,'pendente'),
('Instalação de software','Usuário solicita instalação do sistema de contabilidade.',1,NULL,3,'pendente'),
('Verificação de rede','Conexão de internet instável no laboratório 3.',1,NULL,1,'pendente');

-- Inserir apontamentos
INSERT INTO apontamentos (chamado_id, tecnico_id, descricao, comeco, fimatendimento) VALUES
(1,2,'Troca de computador realizada','2025-08-11 09:00','2025-08-11 10:30'),
(2,5,'Antivírus atualizado com sucesso em todas as máquinas','2025-08-13 07:30','2025-08-13 09:00'),
(3,1,'Lâmpada da sala 204 trocada','2025-08-08 11:00','2025-08-08 11:20'),
(4,3,'Manutenção do ar-condicionado realizada','2025-08-17 10:00','2025-08-17 13:00'),
(5,2,'Instalação de nova impressora no RH realizada','2025-08-13 12:00','2025-08-13 13:00'),
(6,1,'Manutenção no cano do banheiro masculino','2025-08-19 15:00','2025-08-19 20:00'),
(7,6,'Manutenção do sistema interno realizada','2025-08-15 16:30','2025-08-15 18:15');

-- Relacionar técnico ao pool
INSERT INTO pool_tecnico (id_pool, id_tecnico) VALUES
(1,2),
(2,1),
(3,1),
(4,3);

-- SELECT organizado para listagem de chamados
SELECT 
  c.id, 
  c.titulo,
  c.descricao,
  p.titulo AS tipo,
  c.status, 
  u.nome AS tecnico,
  c.criado_em
FROM chamados c 
LEFT JOIN pool p ON c.tipo_id = p.id
LEFT JOIN usuarios u ON c.tecnico_id = u.id
ORDER BY c.criado_em DESC;
