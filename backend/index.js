// Importações

import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Usando express, json e cors

const app = express();
app.use(express.json());
app.use(cors());

// Conexão b.d

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "senaisitezelos",
});

const JWT_SECRET = "segredo_super_secreto";

// ------------------ Middleware de autenticação ------------------

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ mensagem: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ mensagem: "Token inválido" });
    req.user = user;
    next();
  });
}

// ------------------ LOGIN ------------------

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca o usuário pelo email
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ mensagem: "Credenciais inválidas" });

    const usuario = rows[0];

    // Verifica se o usuário está ativo
    if (usuario.status !== "ativo") {
      return res.status(403).json({ mensagem: "Conta inativa. Contate o administrador." });
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ mensagem: "Credenciais inválidas" });

    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, funcao: usuario.funcao, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      funcao: usuario.funcao,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ------------------ ROTAS USUÁRIOS ------------------

app.get("/api/usuarios", authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    let query = "SELECT id, nome, email, funcao, status FROM usuarios";
    let params = [];

    if (role) {
      query += " WHERE funcao = ?";
      params.push(role);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ ROTAS CHAMADOS ------------------


// Criar chamado (usuário)

app.post("/api/chamados/novo", authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, tipo_id, usuario_id } = req.body;

    const [result] = await db.query(
      "INSERT INTO chamados (titulo, descricao, tipo_id, usuario_id, status, criado_em) VALUES (?, ?, ?, ?, 'pendente', NOW())",
      [titulo, descricao, tipo_id, usuario_id]
    );

    res.status(201).json({ message: "Chamado criado!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Todos chamados (admin)

app.get("/api/chamados", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, 
              u.nome AS usuario, 
              t.nome AS tecnico
       FROM chamados c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       LEFT JOIN usuarios t ON c.tecnico_id = t.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chamados de um usuário

app.get("/api/chamados/meus-chamados/:usuarioId", authMiddleware, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const [rows] = await db.query(
      `SELECT c.*, t.nome AS tecnico 
       FROM chamados c
       LEFT JOIN usuarios t ON c.tecnico_id = t.id
       WHERE c.usuario_id = ?`,
      [usuarioId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chamados disponíveis (sem técnico)

app.get("/api/chamados/disponiveis", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM chamados WHERE tecnico_id IS NULL AND status = 'pendente'");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chamados de um técnico

app.get("/api/chamados/tecnico/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM chamados WHERE tecnico_id = ?", [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assumir chamado

app.post("/api/chamados/assumir/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { tecnico_id } = req.body;

    await db.query("UPDATE chamados SET tecnico_id = ?, status = 'em andamento' WHERE id = ?", [
      tecnico_id,
      id,
    ]);

    res.json({ message: "Chamado assumido!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Atualizar usuario (e histórico)

app.put("/api/usuarios/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, funcao, status } = req.body;

    const [result] = await db.query(
      "UPDATE usuarios SET nome = ?, email = ?, funcao = ?, status = ? WHERE id = ?",
      [nome, email, funcao, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ message: "Usuário atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar usuário

app.delete("/api/usuarios/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ message: "Usuário deletado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Técnicos ativos

app.get("/api/usuarios", authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    let query = "SELECT id, nome, email, funcao, status FROM usuarios WHERE 1=1";
    let params = [];

    if (role) {
      query += " AND funcao = ?";
      params.push(role);
    }

    // Sempre traz só ativos
    query += " AND status = 'ativo'";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Rota para histórico de um chamado

app.get("/api/chamados/:id/historico", async (req, res) => {
  const chamadoId = req.params.id;

  try {
    const [rows] = await db.execute(`
      SELECT h.id, h.acao, u.nome AS usuario,
             DATE_FORMAT(h.criado_em, '%Y-%m-%d') AS criado_em
      FROM historico_chamados h
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.chamado_id = ?
      ORDER BY h.criado_em DESC
    `, [chamadoId]);

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ error: "Erro ao buscar histórico do chamado" });
  }
});




app.delete("/api/chamados/excluir/:id", authMiddleware, async (req, res) => {
  try {
    const chamadoId = Number(req.params.id);
    if (isNaN(chamadoId)) return res.status(400).json({ message: "ID inválido" });

    console.log("Tentando deletar chamado:", chamadoId);

    // Deleta apontamentos relacionados
    await db.query("DELETE FROM apontamentos WHERE chamado_id = ?", [chamadoId]);

    // Deleta histórico do chamado
    await db.query("DELETE FROM historico_chamados WHERE chamado_id = ?", [chamadoId]);

    // Deleta o próprio chamado
    const [result] = await db.query("DELETE FROM chamados WHERE id = ?", [chamadoId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Chamado não encontrado ou não pôde ser deletado" });
    }

    console.log("Chamado deletado com sucesso:", chamadoId);
    res.json({ message: "Chamado deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar chamado:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// ------------------ APONTAMENTOS ------------------                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   

app.post("/api/apontamentos", authMiddleware, async (req, res) => {
  try {
    const { chamado_id, tecnico_id, descricao, comeco, fimatendimento } = req.body;

    const [result] = await db.query(
      "INSERT INTO apontamentos (chamado_id, tecnico_id, descricao, comeco, fimatendimento) VALUES (?, ?, ?, ?, ?)",
      [chamado_id, tecnico_id, descricao, comeco, fimatendimento]
    );

    res.status(201).json({ message: "Apontamento registrado!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.put("/api/chamados/:id", authMiddleware, async (req, res) => {
  const chamadoId = req.params.id;
  const dadosAtualizados = req.body;
  const usuarioId = req.user.id; // Pega direto do token

  const [results] = await db.query("SELECT * FROM chamados WHERE id = ?", [chamadoId]);
  if (results.length === 0) {
    return res.status(404).json({ error: "Chamado não encontrado" });
  }

  const chamadoAtual = results[0];

  const campos = Object.keys(dadosAtualizados);
  if (campos.length === 0) {
    return res.status(400).json({ error: "Nenhum campo para atualizar" });
  }

  const valores = campos.map((campo) => dadosAtualizados[campo]);
  const setString = campos.map((campo) => `${campo} = ?`).join(", ");

  await db.query(`UPDATE chamados SET ${setString} WHERE id = ?`, [...valores, chamadoId]);

  const alteracoes = campos
    .map((campo) => {
      const valorAntigo = chamadoAtual[campo];
      const valorNovo = dadosAtualizados[campo];
      if (valorAntigo != valorNovo) {
        return `${campo}: "${valorAntigo}" → "${valorNovo}"`;
      }
      return null;
    })
    .filter(Boolean);

  if (alteracoes.length > 0) {
    const descricao = `Alterações: ${alteracoes.join("; ")}`;
    await db.query(
      "INSERT INTO historico_chamados (chamado_id, acao, usuario_id, criado_em) VALUES (?, ?, ?, NOW())",
      [chamadoId, descricao, usuarioId]
    );
  }

  res.json({ message: "Chamado atualizado e histórico registrado" });
});

// --------  Mensagens ----------

app.post("/api/mensagens", authMiddleware, async (req, res) => {
  try {
    const { tecnico_id, mensagem } = req.body;
    const usuario_id = req.user.id;

    const [result] = await db.query(
      "INSERT INTO mensagens (usuario_id, tecnico_id, mensagem) VALUES (?, ?, ?)",
      [usuario_id, tecnico_id, mensagem]
    );

    res.status(201).json({ message: "Mensagem enviada!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/buscar/mensagens", authMiddleware, async (req, res) => {
  try {
    const tecnico_id = req.user.id;
    const [rows] = await db.query(
      `SELECT m.*, u.nome AS usuario 
       FROM mensagens m 
       LEFT JOIN usuarios u ON m.usuario_id = u.id 
       WHERE tecnico_id = ? 
       ORDER BY criado_em DESC`,
      [tecnico_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/mensagens/:id/responder", authMiddleware, async (req, res) => {
  try {
    const tecnico_id = req.user.id;
    const { resposta } = req.body;
    const mensagemId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM mensagens WHERE id = ? AND tecnico_id = ?",
      [mensagemId, tecnico_id]
    );

    if (rows.length === 0) return res.status(403).json({ message: "Mensagem não encontrada ou acesso negado" });

    await db.query(
      "UPDATE mensagens SET resposta = ?, respondida = TRUE WHERE id = ?",
      [resposta, mensagemId]
    );

    res.json({ message: "Resposta enviada!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/mensagens/meus", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const [rows] = await db.query(
      `SELECT m.*, u.nome AS tecnico_nome
       FROM mensagens m
       LEFT JOIN usuarios u ON m.tecnico_id = u.id
       WHERE m.usuario_id = ?
       ORDER BY m.criado_em DESC`,
      [usuario_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar mensagem do usuário

app.delete("/api/mensagens/:id", authMiddleware, async (req, res) => {
  try {
    const mensagemId = Number(req.params.id);
    const usuarioId = req.user.id;

    if (isNaN(mensagemId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // Verifica se a mensagem pertence ao usuário
    const [rows] = await db.query(
      "SELECT * FROM mensagens WHERE id = ? AND usuario_id = ?",
      [mensagemId, usuarioId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Mensagem não encontrada ou acesso negado" });
    }

    // Deleta a mensagem
    await db.query("DELETE FROM mensagens WHERE id = ?", [mensagemId]);

    res.json({ message: "Mensagem deletada com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/mensagens/:id/tecnico", authMiddleware, async (req, res) => {
  try {
    const mensagemId = Number(req.params.id);
    const tecnicoId = req.user.id;

    if (isNaN(mensagemId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // Verifica se a mensagem pertence a este técnico
    const [rows] = await db.query(
      "SELECT * FROM mensagens WHERE id = ? AND tecnico_id = ?",
      [mensagemId, tecnicoId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Mensagem não encontrada ou acesso negado" });
    }

    await db.query("DELETE FROM mensagens WHERE id = ?", [mensagemId]);

    res.json({ message: "Mensagem deletada com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------  Iniciar servidor ------------------

app.listen(3005, () => {
  console.log("Servidor rodando na porta 3005");
});
