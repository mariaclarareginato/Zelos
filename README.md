# Zelos

<img width="1825" height="890" alt="image" src="https://github.com/user-attachments/assets/68a0a8a9-4822-4115-b6a4-06f29903f945" />


## Sistema de gerenciamento de chamados, apontamentos e patrimônios desenvolvido como projeto acadêmico - Escola SENAI Armando de Arruda Pereira

Este é um projeto de **sistema de chamados** para a **Escola SENAI Armando de Arruda Pereira**, desenvolvido para gerenciar solicitações de manutenção, apoio técnico e outros serviços para itens identificados pelo número de patrimônio da escola. O sistema foi construído com **Next.js**, **Node.js** e **MySQL**.

## Índice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Como Iniciar](#como-iniciar)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Banco de Dados](#banco-de-dados)
6. [Desenvolvimento](#desenvolvimento)
7. [Integração AD](#integração-ad)
8. [Licença](#licença)

## Sobre o Projeto

Este sistema permite que os usuários registrem chamados de manutenção e outros serviços para itens da escola, utilizando o **número de patrimônio** como identificador dos itens. Ele permite que os técnicos e administradores acompanhem o progresso dos chamados, façam apontamentos sobre o status das manutenções e gerenciem o histórico de serviços realizados.

### Funcionalidades Principais:

- **Criação de Chamados**: Usuários abrem chamados informando patrimônio e tipo de serviço.  
- **Acompanhamento em Tempo Real**: Status atualizado em cada interação.  
- **Apontamentos Técnicos**: Técnicos podem detalhar atividades realizadas.  
- **Relatórios**: Exportação de chamados, técnicos e serviços.  
- **Mensagens**: Comunicação direta entre usuários e técnicos.  

## Tecnologias Utilizadas

- **Frontend**: [Next.js](https://nextjs.org/) + React  
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) 
- **Banco de Dados**: [MySQL](https://www.mysql.com/) (via [MySQL2](https://www.npmjs.com/package/mysql2))
- **Autenticação**: Active Directory (AD) integrado  

## Como Iniciar

### Pré-requisitos

Antes de começar, é necessário ter as seguintes ferramentas instaladas em sua máquina:

- **Node.js** (versão >= 14.x)
- **MySQL** (ou equivalente)
- **Xampp** (ou equivalente, para gerenciar MySQL)

### 1. Clonar o repositório

```bash
git clone https://github.com/mariaclarareginato/Zelos.git
cd Zelos
```

### 2. Instalar dependências

Execute o comando abaixo para instalar as dependências do projeto:

```bash
cd frontend
npm install
cd ..
cd backend
npm install
cd ..
```

### 3. Configuração do Banco de Dados

No MySQL, execute o script `init.sql` para criar o banco e tabelas  
(**lembre-se de iniciar o XAMPP** para rodar o MySQL).

### 4. Iniciar servidores backend:

Inicie os dois servidores **separados** para desenvolvimento do Node.js e do Express:

```bash
cd backend
node index.js --watch                                      
```

```bash
cd c.l.es
node server.js --watch                                         
```

O Servidor `index.js` roda na porta **3005** e o `server.js` na **3004**

### 5. Iniciar servidor frontend:

Inicie o servidor de desenvolvimento do Next.js:

```bash
cd ..
cd frontend
npm run dev
```

Agora, o sistema estará rodando em `http://localhost:3000`.

## Estrutura de Diretórios

A estrutura de diretórios do projeto segue a organização padrão do Next.js, com algumas adições para o backend:

```
Zelos/
├── backend/                # Backend com Node.js + Express
│   ├── c.l.es/             # Rotas de cadastro e recuperação de senha
│   ├── index.js            # Rotas da API
│   └── db.js               # Conexão com MySQL
│
├── frontend/               # Frontend com Next.js
│   ├── public/             # Arquivos públicos (imagens, ícones, vídeos)
│   └── src/app/           
│       ├── cadastro/       # Página de cadastro
│       ├── contato/        # Página de contato
|       ├── termosdeuso/    # Página com termos de uso
|       ├── nossahistoria/  # Página com historia do SENAI
|       ├── home/           # Página que leva para o login ou para o site do SENAI para ajuda/contato.
│       ├── home.admin/     # Área do administrador
│       ├── home.tecnico/   # Área do técnico
│       ├── home.usuario/   # Área do usuário
│       ├── components/     # Componentes reutilizáveis
│       ├── layout.jsx      # Layout base
│       └── globals.css     # Estilos globais
|       
│
└── docs/                   # Documentação extra (como os requisitos do trabalho e o banco de dados)

```

## Banco de Dados

O banco de dados utiliza o **MySQL** com a seguinte estrutura:

- **`usuarios`**: Tabela de usuários, contendo informações como nome, email, senha, função e status.
- **`pool`**: Pool de chamados (ex.: manutenção, apoio técnico, etc.).
- **`pool_tecnico`**: Relacionamento entre técnicos e tipos de serviços.
- **`chamados`**: Tabela de chamados, associando os chamados aos usuários e técnicos.
- **`apontamentos`**: Registra os apontamentos dos técnicos, incluindo horários de início e fim dos serviços.
- **`historico_chamados`**: Histórico de mudanças nos chamados
- **`mensagens`**: Comunicação entre usuários e técnicos

## Desenvolvimento

Este projeto segue boas práticas de desenvolvimento utilizando o framework **Next.js** para o frontend e **Node.js/Express** para o backend. O banco de dados MySQL é acessado utilizando o **MySQL2**, proporcionando uma maneira eficiente e segura de interagir com o banco.

## Integração AD

O backend já está integrado com o AD. Autenticação de usuário é feita via o seguinte endpoint "/auth/login" com o JSON:

```json
{
  "username": "",
  "password": ""
}
```

Este endpoint só funciona via rede cabeada ou wifi B07. Caso precise implementar funcionalidades no endpoint de autenticação, evite remover ou alterar o código existente. Caso o faça, teste e valide.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
