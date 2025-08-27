import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

// Config banco
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sitezelos",
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

// criar chamado (usuário)
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

// todos chamados (admin)
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

// chamados de um usuário
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

// chamados disponíveis (sem técnico)
app.get("/api/chamados/disponiveis", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM chamados WHERE tecnico_id IS NULL AND status = 'pendente'");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// chamados de um técnico
app.get("/api/chamados/tecnico/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM chamados WHERE tecnico_id = ?", [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// assumir chamado
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


// atualizar chamado (e histórico)

app.put("/api/chamados/:id", (req, res) => {
  const chamadoId = req.params.id;
  const dadosAtualizados = req.body;
  const usuarioId = dadosAtualizados.usuario_id;

  if (!usuarioId) {
    return res.status(400).json({ error: "usuario_id é obrigatório" });
  }

  delete dadosAtualizados.usuario_id;

  const buscarChamadoQuery = "SELECT * FROM chamados WHERE id = ?";
  db.query(buscarChamadoQuery, [chamadoId], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar chamado" });
    if (results.length === 0)
      return res.status(404).json({ error: "Chamado não encontrado" });

    const chamadoAtual = results[0];

    const campos = Object.keys(dadosAtualizados);
    if (campos.length === 0)
      return res.status(400).json({ error: "Nenhum campo para atualizar" });

    const valores = campos.map((campo) => dadosAtualizados[campo]);
    const setString = campos.map((campo) => `${campo} = ?`).join(", ");

    const updateQuery = `UPDATE chamados SET ${setString} WHERE id = ?`;

    db.query(updateQuery, [...valores, chamadoId], (err2) => {
      if (err2)
        return res.status(500).json({ error: "Erro ao atualizar chamado" });

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

      if (alteracoes.length === 0) {
        return res.json({ message: "Nenhuma alteração detectada" });
      }

      const descricao = `Alterações: ${alteracoes.join("; ")}`;

      const inserirHistoricoQuery =
        "INSERT INTO historico_chamados (chamado_id, acao, usuario_id, criado_em) VALUES (?, ?, ?, NOW())";
      db.query(
        inserirHistoricoQuery,
        [chamadoId, descricao, usuarioId],
        (err3) => {
          if (err3) {
            console.error(err3);
            return res
              .status(500)
              .json({ error: "Erro ao registrar histórico do chamado" });
          }
          res.json({ message: "Chamado atualizado e histórico registrado" });
        }
      );
    });
  });
});




// fechar chamado
app.post("/api/chamados/:id/fechar", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE chamados SET status = 'concluído' WHERE id = ?", [id]);
    res.json({ message: "Chamado fechado!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// Buscar histórico do chamado por id

app.get("/api/chamados/historico/:id", (req, res) => {
  const chamadoId = req.params.id;
  const query = `
    SELECT h.id, h.acao, u.nome AS usuario,
           DATE_FORMAT(h.criado_em, '%Y-%m-%d %H:%i:%s') AS criado_em
    FROM historico_chamados h
    LEFT JOIN usuarios u ON h.usuario_id = u.id
    WHERE h.chamado_id = ?
    ORDER BY h.criado_em DESC
  `;
  db.query(query, [chamadoId], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Erro ao buscar histórico do chamado" });
    res.json(results);
  });
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

// ------------------ Start Server ------------------
app.listen(3005, () => {
  console.log("Servidor rodando na porta 3005");
});
