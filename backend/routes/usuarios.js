import express from "express";
import db from "../db.js";

const router = express.Router();

// Listar somente técnicos
router.get("/", (req, res) => {
  const role = req.query.role;

  // Se não for 'tecnico', retorna lista vazia para segurança
  if (role !== "tecnico") return res.json([]);

  // Busca só os usuários que têm funcao 'tecnico'
  const query = "SELECT id, nome FROM usuarios WHERE funcao = 'tecnico'";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar técnicos" });
    res.json(results);
  });
});

export default router;
