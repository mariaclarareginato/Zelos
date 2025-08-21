// Painel usuário


"use client";

import { useState, useEffect } from "react";

export default function PainelUsuario() {
  const usuarioLogadoId = 1; // ID fixo só para teste

  const [meusChamados, setMeusChamados] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioLogadoId}`)
      .then((res) => res.json())
      .then(setMeusChamados)
      .catch(() => setMeusChamados([]));
  }, []);

  async function criarChamado(e) {
    e.preventDefault();
    if (!titulo || !descricao || !tipoId) {
      setMensagem("Preencha todos os campos!");
      return;
    }
    const res = await fetch("http://localhost:3005/api/chamados/novo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        descricao,
        tipo_id: tipoId,
        usuario_id: usuarioLogadoId,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMensagem(data.message);
      setTitulo("");
      setDescricao("");
      setTipoId("");
      // Atualizar lista
      fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioLogadoId}`)
        .then((res) => res.json())
        .then(setMeusChamados);
    } else {
      setMensagem(data.error || "Erro ao criar chamado");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Painel do Usuário</h1>

      <section>
        <h2>📨 Abrir chamado: </h2>
        <form onSubmit={criarChamado}>
          <div>
            <label>
              Título:{" "}
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Descrição:{" "}
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Tipo (id):{" "}
              <input
                type="number"
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                min="1"
              />
            </label>
          </div>
          <button type="submit">Criar Chamado</button>
        </form>
        {mensagem && <p>{mensagem}</p>}
      </section>

      <section>
        <h2>🔍 Meus Chamados</h2>
        {meusChamados.length === 0 && <p>Você não tem chamados.</p>}
        <ul>
          {meusChamados.map((chamado) => (
            <li key={chamado.id}>
              <b>{chamado.titulo}</b> — Status: {chamado.status} — Técnico:{" "}
              {chamado.tecnico || "Não atribuído"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
