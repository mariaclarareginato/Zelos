import { query } from '../../../lib/database.js';

export async function GET() {
  try {
    const sql = `
      SELECT id, nome
      FROM usuarios
      WHERE funcao = 'Técnico' AND status = 'ativo'
    `;
    const tecnicos = await query(sql);

    return new Response(JSON.stringify(tecnicos), { status: 200 });
  } catch (error) {
    console.error("Erro na API técnicos:", error);
    return new Response(JSON.stringify({ error: "Erro ao buscar técnicos" }), { status: 500 });
  }
}
