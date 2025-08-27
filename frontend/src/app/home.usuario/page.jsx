'use client';

import { useState, useEffect } from "react";

export default function PainelUsuario() {
  const [usuarioId, setUsuarioId] = useState(null);
  const [token, setToken] = useState(null);
  const [meusChamados, setMeusChamados] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Pegar token e id do usuário do localStorage
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));
    if (usuario) {
      setToken(usuario.token);
      setUsuarioId(usuario.id);
    }
  }, []);

  // Carregar chamados do usuário
  useEffect(() => {
    if (!usuarioId || !token) return;

    const fetchChamados = async () => {
      try {
        const res = await fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMeusChamados(data);
      } catch {
        setMeusChamados([]);
      }
    };

    fetchChamados();
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <br></br><br></br>
      <h1 className="text-center text-5xl font-extrabold text-red-500 mb-12 drop-shadow-lg">Painel do Usuário</h1>

      {/* Formulário Criar Chamado */}
      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Abrir Chamado</h2>
        <form onSubmit={criarChamado} className="max-w-lg mx-auto bg-gray-700 p-6 rounded-xl shadow-xl flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-4 py-2 rounded text-gray-100 bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <br></br>
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-4 py-2 rounded text-gray-100 bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <br></br>
          <input
            type="number"
            placeholder="ID do tipo"
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            className="w-full px-4 py-2 rounded text-gray-100 bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <br></br>
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold transition duration-200"
          >
            Criar Chamado +
          </button>
          <br></br>
          {mensagem && <p className="text-center text-red-300">{mensagem}</p>}
        </form>
      </section>

      {/* Lista de Chamados */}
      <section>
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Seus Chamados</h2>
        {meusChamados.length === 0 ? (
          <p className="text-center text-red-400">Você não tem chamados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meusChamados.map((chamado) => (
              <div key={chamado.id} className="bg-gray-700 p-6 rounded-xl shadow-xl hover:scale-105 transform transition duration-300">
                <h3 className="text-red-400 font-bold text-xl mb-2">{chamado.titulo}</h3>
                <p className="text-gray-200 mb-2">{chamado.descricao}</p>
                <p className="text-gray-300 mb-1"><b>Status:</b> {chamado.status}</p>
                <p className="text-gray-300"><b>Técnico:</b> {chamado.tecnico || "Não atribuído"}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
