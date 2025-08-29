
// Importações

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
const JWT_SECRET = "seusegredoaqui";
import authMiddleware from '../middlewares/authMiddleware.js'

// Usando cors, json e express

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







  // Esqueci senha

app.post("/api/esquecisenha", async (req, res) => {
  const { email, novaSenha } = req.body;

  try {
    // Verifica se existe usuário com esse email
    const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (usuarios.length === 0) return res.status(400).json({ erro: "Usuário não encontrado" });

    const usuario = usuarios[0];
    if (usuario.status !== "ativo") return res.status(403).json({ erro: "Usuário inativo" });

    // Criptografa a nova senha
    const hashSenha = await bcrypt.hash(novaSenha, 10);

    // Atualiza no banco
    await db.execute("UPDATE usuarios SET senha = ? WHERE email = ?", [hashSenha, email]);

    res.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});


// Atualizar status do chamado (apenas técnico responsável)

app.put("/api/chamados/:id/status", authMiddleware, async (req, res) => {
  try {
    const chamadoId = req.params.id;
    const { status } = req.body;
    const tecnicoId = req.user.id; // técnico logado

    if (!status) return res.status(400).json({ message: "O campo 'status' é obrigatório" });

    // Busca o chamado
    const [rows] = await db.query("SELECT * FROM chamados WHERE id = ?", [chamadoId]);
    if (rows.length === 0) return res.status(404).json({ message: "Chamado não encontrado" });

    const chamado = rows[0];

    // Verifica se o técnico é o responsável
    if (chamado.tecnico_id !== tecnicoId) {
      return res.status(403).json({ message: "Você não pode atualizar o status deste chamado" });
    }

    // Atualiza status
    await db.query("UPDATE chamados SET status = ? WHERE id = ?", [status, chamadoId]);

    // Adiciona ao histórico
    const descricao = `Status alterado de "${chamado.status}" para "${status}"`;
    await db.query(
      "INSERT INTO historico_chamados (chamado_id, acao, usuario_id, criado_em) VALUES (?, ?, ?, NOW())",
      [chamadoId, descricao, tecnicoId]
    );

    res.json({ message: "Status do chamado atualizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar status do chamado", error: err.message });
  }
});


// Iniciar servidor

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});





