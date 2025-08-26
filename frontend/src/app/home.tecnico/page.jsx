"use client";

import { useEffect, useState } from "react";
let jwtDecode;
if (typeof window !== "undefined") {
  jwtDecode = (await import("jwt-decode")).default;
}

export default function HomeTecnico() {
  const [chamadosDisponiveis, setChamadosDisponiveis] = useState([]);
  const [meusChamados, setMeusChamados] = useState([]);
  const [selectedChamadoId, setSelectedChamadoId] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [historico, setHistorico] = useState([]);
  const [message, setMessage] = useState("");

  const [token, setToken] = useState(null);
  const [tecnicoId, setTecnicoId] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    if (t && jwtDecode) {
      const decoded = jwtDecode(t);
      setTecnicoId(decoded.id);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        const [resDisponiveis, resMeus] = await Promise.all([
          fetch("http://localhost:3005/api/chamados/disponiveis", { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:3005/api/chamados/tecnico/${tecnicoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setChamadosDisponiveis(await resDisponiveis.json());
        setMeusChamados(await resMeus.json());
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [token, tecnicoId]);

  useEffect(() => {
    if (!selectedChamadoId) {
      setHistorico([]);
      setNovoStatus("");
      return;
    }

    const chamado = meusChamados.find(c => c.id === Number(selectedChamadoId));
    if (chamado) {
      setNovoStatus(chamado.status || "");
    }

    async function fetchHistorico() {
      try {
        const res = await fetch(`http://localhost:3005/api/chamados/historico/${selectedChamadoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistorico(await res.json());
      } catch (err) {
        console.error(err);
        setHistorico([]);
      }
    }

    fetchHistorico();
  }, [selectedChamadoId, meusChamados, token]);

  const assumirChamado = async (id) => {
    try {
      const res = await fetch(`http://localhost:3005/api/chamados/assumir/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tecnico_id: tecnicoId }),
      });
      const data = await res.json();
      setMessage(data.message || "Chamado assumido!");
      const resMeus = await fetch(`http://localhost:3005/api/chamados/tecnico/${tecnicoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeusChamados(await resMeus.json());
    } catch (err) {
      console.error(err);
      setMessage("Erro ao assumir chamado");
    }
  };

  const atualizarChamado = async () => {
    if (!selectedChamadoId) return;
    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: novoStatus }),
      });
      const data = await res.json();
      setMessage(data.message || "Chamado atualizado!");
      const resMeus = await fetch(`http://localhost:3005/api/chamados/tecnico/${tecnicoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeusChamados(await resMeus.json());
    } catch (err) {
      console.error(err);
      setMessage("Erro ao atualizar chamado");
    }
  };

  return (
    <main className="p-6 bg-black min-h-screen">

      <br></br><br></br>
      <h1 className="text-3xl font-bold mt-20 text-center text-gray-400 underline">Painel do Técnico</h1>

      {/* Chamados disponíveis */}
      <section className="my-6">
        <h2 className="text-xl text-center text-gray-400">Chamados disponíveis</h2>
        {chamadosDisponiveis.length === 0 ? (
          <p className="text-center text-red-400">Nenhum chamado disponível.</p>
        ) : (
          chamadosDisponiveis.map(c => (
            <div key={c.id} className="border p-3 rounded mb-2 bg-gray-500 text-red-900">
              <h3 className="font-semibold">{c.titulo}</h3>
              <p>{c.descricao}</p>
              <button
                className="bg-red-900 text-gray-300 px-3 py-1 rounded mt-2"
                onClick={() => assumirChamado(c.id)}
              >
                Assumir
              </button>
            </div>
          ))
        )}
      </section>

      {/* Meus chamados */}
      <section className="my-6">
        <h2 className="text-xl text-center text-gray-400">Seus chamados</h2>
        <select
          className="text-center border rounded p-2 w-full max-w-md bg-gray-500 text-red-900 mb-4"
          value={selectedChamadoId}
          onChange={e => setSelectedChamadoId(e.target.value)}
        >
          <option value="">-- Selecione um chamado --</option>
          {meusChamados.map(c => (
            <option key={c.id} value={c.id}>{c.titulo} ({c.status})</option>
          ))}
        </select>

        {selectedChamadoId && (
          <div className="bg-gray-500 text-red-900 p-4 rounded shadow">
            <label className="block mb-1 text-red-900 ">Status:</label>
            <select
              className="border rounded p-2 w-full bg-gray-500 text-red-900 mb-2 "
              value={novoStatus}
              onChange={e => setNovoStatus(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              <option value="pendente">Pendente</option>
              <option value="em andamento">Em andamento</option>
              <option value="concluído">Concluído</option>
            </select>

            <button
              className="bg-red-900 text-gray-400 px-4 py-2 rounded hover:bg-red-600"
              onClick={atualizarChamado}
            >
              Atualizar
            </button>

            {message && <p className="mt-2 text-sm text-red-800 bg-gray-400">{message}</p>}

            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-red-900">Histórico</h3>
              <ul className="list-disc pl-5 text-red-900">
                {historico.map(h => <li key={h.id}>{h.descricao}</li>)}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
