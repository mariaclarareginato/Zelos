"use client";
import { useEffect, useState } from "react";

// ✅ Import ESM correto para Next.js 13
let jwtDecode;
if (typeof window !== "undefined") {
  jwtDecode = (await import("jwt-decode")).default;
}

export default function HomeAdmin() {
  const [chamados, setChamados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedChamadoId, setSelectedChamadoId] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [selectedTecnicoId, setSelectedTecnicoId] = useState("");
  const [historico, setHistorico] = useState([]);
  const [message, setMessage] = useState("");

  const [token, setToken] = useState(null);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);

  // Pegando token e id do usuário logado
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    if (t && jwtDecode) {
      const decoded = jwtDecode(t);
      setUsuarioLogadoId(decoded.id);
    }
  }, []);

  // Carregando chamados, técnicos e usuários
  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        const [resChamados, resTecnicos, resUsuarios] = await Promise.all([
          fetch("http://localhost:3005/api/chamados", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3005/api/usuarios?role=tecnico", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3005/api/usuarios", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setChamados(await resChamados.json());
        setTecnicos(await resTecnicos.json());
        setUsuarios(await resUsuarios.json());
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [token]);

  // Atualiza histórico sempre que o chamado selecionado muda
  useEffect(() => {
    if (!selectedChamadoId) {
      setHistorico([]);
      setNovoStatus("");
      setSelectedTecnicoId("");
      return;
    }

    const chamado = chamados.find(c => c.id === Number(selectedChamadoId));
    if (chamado) {
      setNovoStatus(chamado.status || "");
      setSelectedTecnicoId(chamado.tecnico_id || "");
    }

    async function fetchHistorico() {
      try {
        const res = await fetch(`http://localhost:3005/api/chamados/historico/${selectedChamadoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHistorico(data);
      } catch (error) {
        console.error(error);
        setHistorico([]);
      }
    }

    fetchHistorico();

    // Atualiza automaticamente a cada 5s
    const interval = setInterval(fetchHistorico, 5000);
    return () => clearInterval(interval);
  }, [selectedChamadoId, chamados, token]);

  // Atualizar chamado
  async function atualizarChamado() {
    if (!selectedChamadoId) {
      setMessage("Selecione um chamado");
      return;
    }

    const dados = {
      usuario_id: usuarioLogadoId,
      status: novoStatus,
      tecnico_id: selectedTecnicoId || null,
    };

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dados),
      });
      const data = await res.json();
      setMessage(data.message || "Atualizado com sucesso");

      // Atualiza lista de chamados
      const chamadosRes = await fetch("http://localhost:3005/api/chamados", { headers: { Authorization: `Bearer ${token}` } });
      setChamados(await chamadosRes.json());
    } catch (error) {
      console.error(error);
      setMessage("Erro ao atualizar");
    }
  }

  // Fechar chamado
  async function fecharChamado() {
    if (!selectedChamadoId) return;
    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}/fechar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessage(data.message || "Chamado fechado");

      // Atualiza lista de chamados
      const chamadosRes = await fetch("http://localhost:3005/api/chamados", { headers: { Authorization: `Bearer ${token}` } });
      setChamados(await chamadosRes.json());
    } catch (error) {
      console.error(error);
      setMessage("Erro ao fechar");
    }
  }

  // Deletar chamado
  async function deletarChamado() {
    if (!selectedChamadoId) return;

    if (!confirm("Tem certeza que deseja deletar este chamado?")) return;

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/excluir/${selectedChamadoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMessage(data.message || "Chamado deletado com sucesso!");

      // Atualiza lista de chamados
      const chamadosRes = await fetch("http://localhost:3005/api/chamados", { headers: { Authorization: `Bearer ${token}` } });
      setChamados(await chamadosRes.json());

      // Limpa seleção e histórico
      setSelectedChamadoId("");
      setHistorico([]);
      setNovoStatus("");
      setSelectedTecnicoId("");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao deletar chamado");
    }
  }

  return (
    <main className="p-6 bg-black min-h-screen">
      <br></br>
      <h1 className="text-3xl font-bold mt-20 text-center text-gray-400 underline">Painel do Administrador</h1>

      {/* Seletor de chamado */}
      <section className="flex justify-center mb-6 mt-6">
        <select
          className="text-center border rounded p-2 w-full max-w-md bg-gray-500 text-red-900"
          value={selectedChamadoId}
          onChange={(e) => setSelectedChamadoId(e.target.value)}
        >
          <option value="">-- Selecione um chamado --</option>
          {chamados.map(c => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </section>

      {/* Edição do chamado */}
      {selectedChamadoId && (
        <section className="mb-6 bg-gray-400 p-4 rounded shadow">
          <h2 className="text-center text-lg font-semibold mb-2 text-red-900">Editar Chamado</h2>

          {/* Status */}
          <div className="mb-2 bg-gray-400">
            <label className="block mb-1 text-red-900">Status:</label>
            <select
              className="border rounded p-2 w-full bg-gray-500 text-red-900"
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              <option value="pendente">Pendente</option>
              <option value="em andamento">Em andamento</option>
              <option value="concluído">Concluído</option>
            </select>
          </div>

          {/* Técnico */}
          <div className="mb-4">
            <label className="block mb-1 text-red-900">Técnico:</label>
            <select
              className="border rounded p-2 w-full bg-gray-500 text-red-900"
              value={selectedTecnicoId}
              onChange={(e) => setSelectedTecnicoId(e.target.value)}
            >
              <option value="">-- Sem técnico --</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button
              className="bg-red-900 text-gray-300 px-4 py-2 rounded hover:bg-red-600"
              onClick={atualizarChamado}
            >
              Atualizar
            </button>
            <button
              className="bg-red-900 text-gray-300 px-4 py-2 rounded hover:bg-red-700"
              onClick={fecharChamado}
            >
              Fechar Chamado
            </button>
            <button
              className="bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-500"
              onClick={deletarChamado}
            >
              Deletar Chamado
            </button>
          </div>

          {message && <p className="mt-2 text-sm text-red-800">{message}</p>}

          {/* Histórico */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2 text-red-900">Histórico</h3>
            <ul className="list-disc pl-5 text-red-900">
              {historico.map(h => (
                <li key={h.id}>
                  <strong>{h.usuario || "Sistema"}:</strong> {h.acao} - {new Date(h.criado_em).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}



      {/* Lista de usuários */}
      
      <section className="mt-16 px-4">
  <h2 className="text-2xl font-bold text-center text-red-500 mb-8">Usuários</h2>

  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
    {usuarios.map(u => (
      <li
        key={u.id}
        className="bg-gray-800 text-red-500 p-6 rounded-2xl shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-105 flex flex-col gap-2 items-center text-center w-full max-w-xs aspect-[4/3]"
      >
        <span className="font-semibold text-lg">{u.nome}</span>
        <span className="text-sm text-gray-300">{u.funcao}</span>
        <span className="text-sm text-gray-400">{u.status}</span>
      </li>
    ))}
  </ul>
</section>




    </main>
  );
}
