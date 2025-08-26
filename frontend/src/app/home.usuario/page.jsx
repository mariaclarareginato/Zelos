"use client";

import { useState, useEffect } from "react";
let jwtDecode;
if (typeof window !== "undefined") {
  jwtDecode = (await import("jwt-decode")).default;
}

export default function PainelUsuario() {
  const [usuarioId, setUsuarioId] = useState(null);
  const [token, setToken] = useState(null);

  const [meusChamados, setMeusChamados] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Pegar token e ID do usuário
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    if (t && jwtDecode) {
      const decoded = jwtDecode(t);
      setUsuarioId(decoded.id);
    }
  }, []);

  // Carregar chamados do usuário
  useEffect(() => {
    if (!usuarioId || !token) return;
    fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setMeusChamados)
      .catch(() => setMeusChamados([]));
  }, [usuarioId, token]);

  // Criar chamado
  async function criarChamado(e) {
    e.preventDefault();
    if (!titulo || !descricao || !tipoId) {
      setMensagem("Preencha todos os campos!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3005/api/chamados/novo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ titulo, descricao, tipo_id: tipoId, usuario_id: usuarioId }),
      });
      const data = await res.json();

      if (res.ok) {
        setMensagem(data.message || "Chamado criado com sucesso!");
        setTitulo("");
        setDescricao("");
        setTipoId("");

        // Atualizar lista
        const resChamados = await fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeusChamados(await resChamados.json());
      } else {
        setMensagem(data.error || "Erro ao criar chamado");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao criar chamado");
    }
  }

  return (
    <main className="p-6 bg-black min-h-screen">
      <h1 className="text-center text-3xl font-bold mt-20 text-gray-400 underline">Painel do Usuário</h1>

      {/* Formulário para criar chamado */}
      <section className="my-6 flex flex-col items-center">
  <h2 className="text-xl text-center text-gray-400 mb-4">Abrir chamado</h2>
  
  <form onSubmit={criarChamado} className="w-full max-w-md flex flex-col items-center space-y-4">
    <input
      type="text"
      placeholder="Título"
      value={titulo}
      onChange={(e) => setTitulo(e.target.value)}
      className="w-full px-4 py-2 rounded text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
    />

    <br></br>

    <textarea
      placeholder="Descrição"
      value={descricao}
      onChange={(e) => setDescricao(e.target.value)}
      className="w-full px-4 py-2 rounded text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
    />

<br></br>
    <input
      type="number"
      placeholder="ID"
      value={tipoId}
      onChange={(e) => setTipoId(e.target.value)}
      className="w-full px-4 py-2 rounded text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
    />
    <br></br>

    <button
      type="submit"
      className="w-full bg-red-900 text-gray-300 py-2 rounded hover:bg-red-800"
    >
      Criar Chamado +
    </button>
  </form>

  <br></br>

  {mensagem && <p className="text-center text-red-400 mt-2">{mensagem}</p>}
</section>

      {/* Lista de chamados */}
      <section className="my-6">
        <h2 className="text-xl text-center text-gray-400 mb-4">Seus Chamados:</h2>
        {meusChamados.length === 0 ? (
          <p className="text-center text-red-400">Você não tem chamados.</p>
        ) : (
          <ul className="max-w-md mx-auto space-y-2">
            {meusChamados.map((chamado) => (
              <li key={chamado.id} className="border p-3 rounded bg-gray-500 text-red-900">
                <b>{chamado.titulo}</b> — Status: {chamado.status} — Técnico: {chamado.tecnico || "Não atribuído"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
