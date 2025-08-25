// index.js
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
  database: "zelossitesenai",
});

// Função para padronizar respostas
const sendResponse = (res, data) => {
  res.json({ success: true, data });
};

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ---------------- ROTAS ----------------

// Registrar usuário
app.post("/api/register", async (req, res) => {
  const { nome, email, senha, funcao } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const [result] = await db.query(
      "INSERT INTO usuarios (nome, email, senha, funcao) VALUES (?,?,?,?)",
      [nome, email, hashedPassword, funcao]
    );
    sendResponse(res, { id: result.insertId, nome, email, funcao });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) return res.status(400).json({ error: "Usuário não encontrado" });

    const user = rows[0];
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(400).json({ error: "Senha incorreta" });

    const token = jwt.sign(
      { id: user.id, email: user.email, funcao: user.funcao },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    sendResponse(res, { token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar chamado (usuário)
app.post("/api/chamados", authMiddleware, async (req, res) => {
  const { descricao, tipo_id } = req.body;
  const usuario_id = req.user.id;
  try {
    const [result] = await db.query(
      "INSERT INTO chamados (descricao, tipo_id, usuario_id) VALUES (?,?,?)",
      [descricao, tipo_id, usuario_id]
    );
    sendResponse(res, {
      id: result.insertId,
      descricao,
      tipo_id,
      status: "pendente",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar chamados do usuário logado
app.get("/api/chamados", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM chamados WHERE usuario_id = ?",
      [req.user.id]
    );
    sendResponse(res, rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos os chamados (apenas admin)
app.get("/api/admin/chamados", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "admin") return res.sendStatus(403);
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.descricao, c.status, u.nome AS usuario, t.nome AS tipo
       FROM chamados c
       JOIN usuarios u ON c.usuario_id = u.id
       JOIN tipos_chamado t ON c.tipo_id = t.id`
    );
    sendResponse(res, rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status do chamado (apenas técnico)
app.put("/api/tecnico/chamados/:id", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "tecnico") return res.sendStatus(403);
  const { status } = req.body;
  try {
    await db.query("UPDATE chamados SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    sendResponse(res, { id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- START ----------------
app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});
