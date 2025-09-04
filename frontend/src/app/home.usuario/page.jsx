'use client';

// Imoortações

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeUsuario() {
  const router = useRouter();
  const [usuarioId, setUsuarioId] = useState(null);
  const [token, setToken] = useState(null);
  const [meusChamados, setMeusChamados] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [mensagemAviso, setMensagemAviso] = useState("");

  // Recupera usuário autenticado
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));
    if (!usuario) return router.push("/");
    const email = usuario.email?.toLowerCase() || "";
    if (!email.endsWith("@senaisp.com")) return router.push("/home");
    setToken(usuario.token);
    setUsuarioId(Number(usuario.id));
  }, [router]);

  // Busca chamados e mensagens
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

    const fetchMensagens = async () => {
      try {
        const res = await fetch("http://localhost:3005/api/mensagens/meus", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMensagens(data);
      } catch {
        setMensagens([]);
      }
    };

    fetchChamados();
    fetchMensagens();
  }, [usuarioId, token]);

  // Criar chamado

  async function criarChamado(e) {
    e.preventDefault();
    if (!titulo || !descricao || !tipoId) {
      setMensagemAviso("Preencha todos os campos!");
      return;
    }
    if (![1, 2, 3, 4].includes(Number(tipoId))) {
      setMensagemAviso("Tipo inválido. Escolha entre 1 e 4.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3005/api/chamados/novo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, descricao, tipo_id: tipoId, usuario_id: usuarioId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagemAviso(data.message || "Chamado criado com sucesso!");
        setTitulo("");
        setDescricao("");
        setTipoId("");
        // Atualiza chamados
        const resChamados = await fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeusChamados(await resChamados.json());
      } else {
        setMensagemAviso(data.error || "Erro ao criar chamado");
      }
    } catch (err) {
      console.error(err);
      setMensagemAviso("Erro ao criar chamado");
    }
  }

  // Deletar mensagem
  
  async function deletarMensagem(id) {
  if (!confirm("Deseja realmente deletar esta mensagem?")) return;
  try {
    const res = await fetch(`http://localhost:3005/api/mensagens/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(res.status, data); // Status e mensagem
    if (res.ok) {
      setMensagens((prev) => prev.filter((m) => m.id !== id));
    } else {
      alert(data.message || "Erro ao deletar mensagem");
    }
  } catch (err) {
    console.error(err);
  }
}


  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <h1 className="text-center text-5xl font-extrabold text-red-500 mb-12 drop-shadow-lg">
        Painel do Usuário
      </h1>

      {/* Formulário Criar Chamado */}
      <section className="mb-12 flex flex-col items-center">
        <h2 className="text-3xl text-gray-200 mb-6 font-semibold text-center">Abrir Chamado</h2>
        <form
          onSubmit={criarChamado}
          className="w-full max-w-lg bg-gray-700 p-6 rounded-2xl shadow-2xl flex flex-col gap-5"
        >
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-4 py-3 rounded text-gray-100 bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-4 py-3 rounded text-gray-100 bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <select
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            className="w-full px-4 py-3 rounded text-gray-100 bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Selecione o tipo (1 a 4) --</option>
            {[1, 2, 3, 4].map((tipo) => (
              <option key={tipo} value={tipo}>
                Tipo {tipo}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition duration-200"
          >
            Criar Chamado +
          </button>
          {mensagemAviso && <p className="text-center text-red-300">{mensagemAviso}</p>}
        </form>
      </section>

      {/* Lista de Chamados */}

      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Seus Chamados</h2>
        {meusChamados.length === 0 ? (
          <p className="text-center text-red-400">Você não tem chamados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meusChamados.map((chamado) => (
              <div
                key={chamado.id}
                className="bg-gray-700 p-6 rounded-2xl shadow-2xl hover:scale-105 transform transition duration-300"
              >
                <h3 className="text-red-400 font-bold text-xl mb-2">{chamado.titulo}</h3>
                <p className="text-gray-200 mb-2">{chamado.descricao}</p>
                <p className="text-gray-300 mb-1">
                  <b>Status:</b> {chamado.status}
                </p>
                <p className="text-gray-300 mb-1">
                  <b>Técnico:</b> {chamado.tecnico || "Não atribuído"}
                </p>
                {chamado.resposta_tecnico && (
                  <p className="text-green-300 mt-2">
                    <b>Resposta do técnico:</b> {chamado.resposta_tecnico}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Botão para enviar nova mensagem */}
      <div className="flex justify-center mb-12">
        <button
          onClick={() => router.push("/contato")}
          className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg transition"
        >
          Enviar nova mensagem a algum técnico
        </button>
      </div>

      {/* Lista de Mensagens do Usuário */}
      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Mensagens Enviadas</h2>
        {mensagens.length === 0 ? (
          <p className="text-center text-red-400">Você não enviou mensagens.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className="bg-gray-700 p-6 rounded-2xl shadow-2xl hover:scale-105 transform transition duration-300"
              >
                <p className="text-gray-100 mb-2">
                  <b>Você:</b> {msg.mensagem}
                </p>
                {msg.resposta && (
                  <p className="text-green-300 mt-1">
                    <b>{msg.tecnico_nome}:</b> {msg.resposta}
                  </p>
                )}
                <button
                  onClick={() => deletarMensagem(msg.id)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-semibold mt-3 w-full transition"
                >
                  Deletar Mensagem
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
