CREATE DATABASE zelos;
USE zelos;

-- Criação da tabela `usuarios`
    CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        funcao VARCHAR(100) NOT NULL,
        status ENUM('ativo', 'inativo') DEFAULT 'ativo',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Criação da tabela `pool`
    CREATE TABLE pool (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo ENUM('externo', 'manutencao', 'apoio_tecnico', 'limpeza') NOT NULL,
        descricao TEXT,
        status ENUM('ativo', 'inativo') DEFAULT 'ativo',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        updated_by INT,
        FOREIGN KEY (created_by) REFERENCES usuarios(id),
        FOREIGN KEY (updated_by) REFERENCES usuarios(id)
    );

    -- Criação da tabela `chamados` 
    CREATE TABLE chamados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        tipo_id INT,
        tecnico_id INT,
        usuario_id INT,
        status ENUM('pendente', 'em andamento', 'concluído') DEFAULT 'pendente',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tipo_id) REFERENCES pool(id),
        FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    -- Criação da tabela `apontamentos` 
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


    -- Criação da tabela `pool_tecnico`
    CREATE TABLE pool_tecnico (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_pool INT,
        id_tecnico INT,
        FOREIGN KEY (id_pool) REFERENCES pool(id),
        FOREIGN KEY (id_tecnico) REFERENCES usuarios(id)
    );

    -- Índices adicionais para otimização
    CREATE INDEX idx_usuarios_email ON usuarios(email);
    CREATE INDEX idx_chamados_status ON chamados(status);
    CREATE INDEX idx_apontamentos_comeco_fim ON apontamentos(comeco, fim);
    
   -- Inserir usuarios
   INSERT INTO usuarios (nome, senha, email, funcao, status) VALUES
   ('Nicolas de Lima', 123, 'nicolas@administrador.com', 'Administrador', 'ativo'),
   ('Pedro Vasconcelos', 456, 'pedro@administrador.com', 'Administrador', 'ativo'),
   ('Sara Limeira', 789, 'sara@administrador.com', 'Administrador', 'inativo'),
   ('Felipe Casaquera', 001, 'felipe@administrador.com', 'Administrador', 'inativo'),
   ('João Carvalho', 012, 'joao@tecnico.com', 'Técnico', 'ativo'),
   ('Fernando Manhasi', 013, 'fernando@tecnico.com', 'Técnico', 'ativo'),
   ('Ricardo Espanha', 014, 'ricardo@tecnico.com', 'Técnico', 'ativo'),
   ('Nicoli Castilho', 015, 'nicoli@tecnico.com', 'Técnico', 'inativo'),
   ('Carlos Ferreira', 016, 'carlos@senaisp.com', 'Usuário', 'ativo'),
   ('Bruno', 017, 'bruno@senaisp.com', 'Usuário', 'ativo'),
   ('Gabriele Oliveira', 135, 'gabi@senaisp.com', 'Usuário', 'inativo'),
   ('Pedro Camões', 134, 'pedro@senaisp.com', 'Usuário', 'inativo');
   
   -- Inserir pool
   INSERT INTO pool (titulo, descricao, created_by, updated_by) VALUES 
    ('apoio_tecnico', 'Suporte em tecnologia da informação', 1, 1),
	('manutencao', 'Manutenção predial', 1, 1),
    ('externo', 'Atendimentos feitos fora da empresa, como visitas técnicas.', 1, 1),
    ('limpeza', 'Solicitações relacionadas à limpeza e higienização dos ambientes.', 1, 1);

   -- Inserir chamados
INSERT INTO chamados (titulo, descricao, tipo_id, tecnico_id, usuario_id, status) VALUES
('Problema com computador', 'O computador não liga mais após queda de energia.', 1, 2, 1, 'pendente'),
('Atualização de software', 'Necessário atualizar o antivírus em todas as máquinas.', 1, 3, 3, 'em andamento'),
('Troca de lâmpada', 'A lâmpada da sala 204 queimou.', 2, 1, 2, 'pendente'),
('Ar-condicionado com defeito', 'Ar-condicionado da recepção está sem funcionar.', 2, 2, 3, 'em andamento'),
('Instalação de impressora', 'Precisa instalar uma nova impressora no setor de RH.', 1, 1, 4, 'concluído'),
('Vazamento no banheiro', 'Banheiro masculino com vazamento no cano.', 2, 2, 2, 'pendente'),
('Erro no sistema interno', 'Sistema está travando na autenticação.', 1, 3, 1, 'pendente'),
('Solicitação de limpeza', 'Precisa de limpeza urgente na sala de reuniões.', 4, NULL, 2, 'pendente'),
('Instalação de software', 'Usuário solicita instalação do sistema de contabilidade.', 1, NULL, 3, 'pendente'),
('Verificação de rede', 'Conexão de internet instável no laboratório 3.', 1, NULL, 1, 'pendente');

   -- Inserir apontamentos 
   
   INSERT INTO apontamentos (chamado_id, tecnico_id, descricao, comeco, fimatendimento) VALUES
   (1, 2, 'Troca de computador realizada', '2025-08-11 09:00', '2025-08-11 10:30'),
   (2, 5, 'Antivírus atualizado com sucesso em todas as máquinas', '2025-08-13 07:30', '2025-08-13 09:00'),
   (3, 1, 'Lâmpada da sala 204 trocada', '2025-08-08 11:00', '2025-08-08 11:20'),
   (4, 3, 'Manutenção do ar-condicionado realizada', '2025-08-17 10:00', '2025-08-17 13:00'), 
   (5, 2, 'Instalação de nova impressora no setor do RH realizada', '2025-08-13 12:00', '2025-08-13 13:00'),
   (6, 1, 'Feita manutenção no cano do banheiro masculino', '2025-08-19 15:00', '2025-08-19 20:00'), 
   (7, 6, 'Manutenção do sistema interno realizada', '2025-08-15 16:30', '2025-08-15 18:15');

   CREATE TABLE historico_chamados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chamado_id INT NOT NULL,
    acao VARCHAR(255),
    usuario_id INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

   
   -- Relacionar tecnico ao problema 
   INSERT INTO pool_tecnico (id_pool, id_tecnico) VALUES
   (1,2),
   (2,1),
   (3,1),
   (4,3);