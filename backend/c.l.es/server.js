// server.js
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
const JWT_SECRET = "seusegredoaqui";

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco
const db = mysql.createPool({
  host: "localhost",
  user: "root",      
  password: "",       
  database: "sitezelos",  
});



// Rota de cadastro de admin

app.post('/cadastro', async (req, res) => {
    const { cpf, email, senha, funcao } = req.body;
  
    try {
      // Verifica se o usuário já existe
      const [usuarios] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
      if (usuarios.length > 0) return res.status(400).json({ erro: 'Email já cadastrado' });
  
      // Criptografa a senha
      const hashSenha = await bcrypt.hash(senha, 10);
  
      // Insere o admin no banco
      await db.execute(
        'INSERT INTO usuarios (nome, senha, email, funcao) VALUES (?, ?, ?, ?)',
        [email.split('@')[0], hashSenha, email, funcao || 'Administrador']
      );
  
      res.json({ mensagem: 'Cadastro de administrador realizado com sucesso!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro no servidor' });
    }
  });
  

// Subir servidor
const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});





// ('Nicolas de Lima', 123, 'nicolas@administradorsenai.com', 'Administrador', 'ativo'),
// ('Pedro Vasconcelos', 456, 'pedro@administradorsenai.com', 'Administrador', 'ativo'), 
//('Sara Limeira', 789, 'sara@administradorsenai.com', 'Administrador', 'inativo'), 
//('Felipe Casaquera', 001, 'felipe@administradorsenai.com', 'Administrador', 'inativo'), 
//('João Carvalho', 012, 'joao@tecnicosenai.com', 'Técnico', 'ativo'), 
//('Fernando Manhasi', 013, 'fernando@tecnicosenai.com', 'Técnico', 'ativo'), 
//('Ricardo Espanha', 014, 'ricardo@tecnicosenai.com', 'Técnico', 'ativo'), 
//('Nicoli Castilho', 015, 'nicoli@tecnicosenai.com', 'Técnico', 'inativo'), 
//('Carlos Ferreira', 016, 'carlos@senaisp.com', 'Usuário', 'ativo'), 
//('Bruno Leite Farias', 017, 'bruno@senaisp.com', 'Usuário', 'ativo'), 
//('Gabriele Oliveira', 135, 'gabi@senaisp.com', 'Usuário', 'inativo'), 
//('Pedro Camões', 134, 'pedro@senaisp.com', 'Usuário', 'inativo');