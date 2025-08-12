import { query } from '../../../lib/database.js';

export async function GET() {
  try {
    const sql = `
      SELECT c.id, c.titulo, c.status, u.nome AS tecnico, p.titulo AS tipo
      FROM chamados c
      LEFT JOIN usuarios u ON c.tecnico_id = u.id
      LEFT JOIN pool p ON c.tipo_id = p.id
      ORDER BY c.criado_em DESC
    `;

    const chamados = await query(sql);

    return new Response(JSON.stringify(chamados), { status: 200 });
  } catch (error) {
    console.error("Erro na API chamados:", error);
    return new Response(JSON.stringify({ error: "Erro ao buscar chamados" }), { status: 500 });
  }
}
