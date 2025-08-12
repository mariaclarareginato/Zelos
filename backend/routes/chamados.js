// backend/routes/chamados.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// Listar todos chamados com nome do técnico
router.get("/", (req, res) => {
  const query = `
    SELECT c.id, c.titulo, c.status, u.nome AS tecnico
    FROM chamados c
    LEFT JOIN usuarios u ON c.tecnico_id = u.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar chamados" });
    res.json(results);
  });
});

// Listar chamados de um usuário específico
router.get("/meus-chamados/:usuarioId", (req, res) => {
  const usuarioId = req.params.usuarioId;
  const query = `
    SELECT c.id, c.titulo, c.status, u.nome AS tecnico
    FROM chamados c
    LEFT JOIN usuarios u ON c.tecnico_id = u.id
    WHERE c.usuario_id = ?
    ORDER BY c.id DESC
  `;
  db.query(query, [usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar seus chamados" });
    res.json(results);
  });
});

// Buscar histórico do chamado por id
router.get("/historico/:id", (req, res) => {
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

// Criar novo chamado
router.post("/novo", (req, res) => {
  const { titulo, descricao, tipo_id, usuario_id } = req.body;
  if (!titulo || !descricao || !tipo_id || !usuario_id) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  const query = `
    INSERT INTO chamados (titulo, descricao, tipo_id, usuario_id, status)
    VALUES (?, ?, ?, ?, 'pendente')
  `;
  db.query(query, [titulo, descricao, tipo_id, usuario_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao criar chamado" });
    res.json({ message: "Chamado criado com sucesso", id: result.insertId });
  });
});

// Atualizar chamado e registrar no histórico
router.put("/:id", (req, res) => {
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

export default router;
