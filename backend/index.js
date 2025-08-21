// server.js
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";


const app = express();
app.use(express.json());
app.use(cors());

// Config do banco
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "zelossitesenai"
});

const JWT_SECRET = "segredo_super_secreto";

// ------------------ AUTENTICAÇÃO ------------------

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Usuário não encontrado" });

    const usuario = rows[0];
    if (String(usuario.senha) !== String(senha)) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    const token = jwt.sign({ id: usuario.id, funcao: usuario.funcao }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware para verificar JWT
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token ausente" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}


// ------------------ ROTAS USUÁRIO COMUM ------------------
app.post("/api/chamados", authMiddleware, async (req, res) => {
  const { titulo, descricao, tipo_id } = req.body;
  const usuario_id = req.user.id;

  try {
    const [result] = await db.query(
      "INSERT INTO chamados (titulo, descricao, tipo_id, usuario_id) VALUES (?,?,?,?)",
      [titulo, descricao, tipo_id, usuario_id]
    );
    res.json({ id: result.insertId, titulo, descricao, tipo_id, status: "pendente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/meus-chamados", authMiddleware, async (req, res) => {
  const usuario_id = req.user.id;
  try {
    const [rows] = await db.query("SELECT * FROM chamados WHERE usuario_id = ?", [usuario_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ ROTAS TÉCNICO ------------------
app.post("/api/chamados/:id/assumir", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "Técnico") return res.status(403).json({ error: "Somente técnicos podem assumir chamados" });

  const chamado_id = req.params.id;
  try {
    await db.query("UPDATE chamados SET tecnico_id = ?, status = 'em andamento' WHERE id = ?", [req.user.id, chamado_id]);
    res.json({ message: "Chamado assumido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chamados/:id/apontamentos", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "Técnico") return res.status(403).json({ error: "Somente técnicos podem registrar apontamentos" });

  const chamado_id = req.params.id;
  const { descricao, comeco, fimatendimento } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO apontamentos (chamado_id, tecnico_id, descricao, comeco, fimatendimento) VALUES (?,?,?,?,?)",
      [chamado_id, req.user.id, descricao, comeco, fimatendimento]
    );
    res.json({ id: result.insertId, message: "Apontamento registrado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ ROTAS ADMIN ------------------

// Criar chamado para qualquer usuário

app.post("/api/chamados", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "Administrador") return res.status(403).json({ error: "Somente administradores" });
  const { titulo, descricao, tipo_id, usuario_id } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO chamados (titulo, descricao, tipo_id, usuario_id) VALUES (?,?,?,?)",
      [titulo, descricao, tipo_id, usuario_id]
    );
    res.json({ id: result.insertId, titulo, descricao, tipo_id, status: "pendente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atribuir chamado a técnico
app.post("/api/chamados/:id/atribuir", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "Administrador") return res.status(403).json({ error: "Somente administradores" });
  const chamado_id = req.params.id;
  const { tecnico_id } = req.body;
  try {
    await db.query("UPDATE chamados SET tecnico_id = ?, status = 'em andamento' WHERE id = ?", [tecnico_id, chamado_id]);
    res.json({ message: "Chamado atribuído ao técnico" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fechar chamado
app.post("/api/chamados/:id/fechar", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "Administrador") return res.status(403).json({ error: "Somente administradores" });
  const chamado_id = req.params.id;
  try {
    await db.query("UPDATE chamados SET status = 'concluído' WHERE id = ?", [chamado_id]);
    res.json({ message: "Chamado fechado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gerenciar usuários (CRUD)
app.get("/api/usuarios", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "Administrador") return res.status(403).json({ error: "Somente administradores" });
  const [rows] = await db.query("SELECT id, nome, email, funcao, status FROM usuarios");
  res.json(rows);
});

app.post("/api/usuarios", authMiddleware, async (req, res) => {
  if (req.user.funcao !== "Administrador") return res.status(403).json({ error: "Somente administradores" });
  const { nome, email, senha, funcao } = req.body;
  const status = "ativo";
  const [result] = await db.query("INSERT INTO usuarios (nome, email, senha, funcao, status) VALUES (?,?,?,?,?)", [nome, email, senha, funcao, status]);
  res.json({ id: result.insertId, nome, email, funcao, status });
});


// ------------------ INICIAR SERVIDOR ------------------
app.listen(3005, () => {
  console.log("Servidor rodando na porta 3005 🚀");
});
