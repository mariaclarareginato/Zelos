"use client";
import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode"; // ✅ Import correto

export default function HomeAdmin() {
  const [chamados, setChamados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedChamadoId, setSelectedChamadoId] = useState("");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [selectedTecnicoId, setSelectedTecnicoId] = useState("");
  const [historico, setHistorico] = useState([]);
  const [message, setMessage] = useState("");

  const [token, setToken] = useState(null);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);

  // ✅ Pegar token do localStorage somente no client
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);

    if (t) {
      const decoded = jwtDecode(t);
      setUsuarioLogadoId(decoded.id);
    }
  }, []);

  // ✅ Buscar dados iniciais quando token estiver disponível
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

  // ✅ Atualizar campos quando selecionar chamado
  useEffect(() => {
    if (!selectedChamadoId) {
      setHistorico([]);
      setNovoTitulo("");
      setNovoStatus("");
      setSelectedTecnicoId("");
      return;
    }

    const chamado = chamados.find(c => c.id === Number(selectedChamadoId));
    if (chamado) {
      setNovoTitulo(chamado.titulo || "");
      setNovoStatus(chamado.status || "");
      setSelectedTecnicoId(chamado.tecnico_id || "");
    }

    async function fetchHistorico() {
      try {
        const res = await fetch(`http://localhost:3005/api/chamados/historico/${selectedChamadoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistorico(await res.json());
      } catch (error) {
        console.error(error);
        setHistorico([]);
      }
    }

    fetchHistorico();
  }, [selectedChamadoId, chamados, token]);

  // ✅ Atualizar chamado
  async function atualizarChamado() {
    if (!selectedChamadoId) {
      setMessage("Selecione um chamado");
      return;
    }

    const dados = { usuario_id: usuarioLogadoId, titulo: novoTitulo, status: novoStatus, tecnico_id: selectedTecnicoId || null };

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dados),
      });
      const data = await res.json();
      setMessage(data.message || "Atualizado com sucesso");

      const chamadosRes = await fetch("http://localhost:3005/api/chamados", { headers: { Authorization: `Bearer ${token}` } });
      setChamados(await chamadosRes.json());
    } catch (error) {
      console.error(error);
      setMessage("Erro ao atualizar");
    }
  }

  // ✅ Fechar chamado
  async function fecharChamado() {
    if (!selectedChamadoId) return;
    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}/fechar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessage(data.message || "Chamado fechado");

      const chamadosRes = await fetch("http://localhost:3005/api/chamados", { headers: { Authorization: `Bearer ${token}` } });
      setChamados(await chamadosRes.json());
    } catch (error) {
      console.error(error);
      setMessage("Erro ao fechar");
    }
  }

  return (
    <main className="p-6 bg-gray-900 min-h-screen">
      <br></br>
      <h1 className="text-3xl font-bold mt-20 text-center text-gray-300">Painel do Administrador</h1>

      <br></br>

      <section className="flex justify-center mb-6 mt-6">
        <select
          className="text-center border rounded p-2 w-full max-w-md"
          value={selectedChamadoId}
          onChange={(e) => setSelectedChamadoId(e.target.value)}
        >
          <option value="">-- Selecione um chamado --</option>
          {chamados.map(c => (
            <option key={c.id} value={c.id}>{c.titulo} - {c.status}</option>
          ))}
        </select>
      </section>

      {selectedChamadoId && (
        <section className="mb-6 bg-gray-400 p-4 rounded shadow">
          <h2 className="text-center text-lg font-semibold mb-2 text-red-900">Editar Chamado</h2>

          <div className="mb-2">
            <label className="block mb-1">Título:</label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Status:</label>
            <select
              className="border rounded p-2 w-full"
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              <option value="pendente">Pendente</option>
              <option value="em andamento">Em andamento</option>
              <option value="concluído">Concluído</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Técnico:</label>
            <select
              className="border rounded p-2 w-full"
              value={selectedTecnicoId}
              onChange={(e) => setSelectedTecnicoId(e.target.value)}
            >
              <option value="">-- Sem técnico --</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-red-900 text-gray-300 px-4 py-2 rounded hover:bg-red-600"
              onClick={atualizarChamado}
            >
              Atualizar
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={fecharChamado}
            >
              Fechar Chamado
            </button>
          </div>

          {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Histórico</h3>
            <ul className="list-disc pl-5">
              {historico.map(h => <li key={h.id}>{h.descricao}</li>)}
            </ul>
          </div>
        </section>
      )}

      <section className="text-center p-4 rounded shadow text-red-700 mt-6">
        <br></br>
        <h2 className="text-lg font-semibold mb-90">Usuários</h2>
        <ul className="list-disc pl-5">
          {usuarios.map(u => (
            <li key={u.id}>{u.nome} - {u.funcao} - {u.status}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
