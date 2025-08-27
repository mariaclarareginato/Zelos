'use client';

import { useEffect, useState } from "react";

export default function HomeTecnico() {
  const [chamadosDisponiveis, setChamadosDisponiveis] = useState([]);
  const [meusChamados, setMeusChamados] = useState([]);
  const [selectedChamadoId, setSelectedChamadoId] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [historico, setHistorico] = useState([]);
  const [message, setMessage] = useState("");

  const [token, setToken] = useState(null);
  const [tecnicoId, setTecnicoId] = useState(null);

  // Campos do apontamento
  const [descricaoApontamento, setDescricaoApontamento] = useState("");
  const [comeco, setComeco] = useState("");
  const [fimatendimento, setFimAtendimento] = useState("");
  const [apontamentoMessage, setApontamentoMessage] = useState("");

  // Pega token e id do localStorage
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));
    if (usuario) {
      setToken(usuario.token);
      setTecnicoId(Number(usuario.id));
    }
  }, []);

  // Atualiza chamados disponíveis e meus chamados
  useEffect(() => {
    if (!token || !tecnicoId) return;

    async function fetchData() {
      try {
        const [resDisponiveis, resMeus] = await Promise.all([
          fetch("http://localhost:3005/api/chamados/disponiveis", { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:3005/api/chamados/tecnico/2`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setChamadosDisponiveis(await resDisponiveis.json());
        setMeusChamados(await resMeus.json());
      } catch (err) {
        console.error("Erro ao buscar chamados:", err);
      }
    }

    fetchData();
  }, [token, tecnicoId]);

  // Atualiza histórico e status ao selecionar chamado
  useEffect(() => {
    if (!selectedChamadoId) {
      setHistorico([]);
      setNovoStatus("");
      return;
    }

    const chamadoSelecionado = meusChamados.find(c => c.id === Number(selectedChamadoId));
    if (chamadoSelecionado) setNovoStatus(chamadoSelecionado.status || "");

    async function fetchHistorico() {
      try {
        const res = await fetch(`http://localhost:3005/api/chamados/historico/${selectedChamadoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistorico(await res.json());
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setHistorico([]);
      }
    }

    fetchHistorico();
  }, [selectedChamadoId, meusChamados, token]);

  // Função para atualizar meus chamados
  const atualizarMeusChamados = async () => {
    if (!token || !tecnicoId) return;
    try {
      const res = await fetch(`http://localhost:3005/api/chamados/tecnico/${tecnicoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeusChamados(await res.json());
    } catch (err) {
      console.error("Erro ao atualizar meus chamados:", err);
    }
  };

  // Assumir um chamado disponível
  const assumirChamado = async (id) => {
    try {
      const res = await fetch(`http://localhost:3005/api/chamados/assumir/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tecnico_id: tecnicoId }),
      });
      const data = await res.json();
      setMessage(data.message || "Chamado assumido!");

      await atualizarMeusChamados();
      const resDisponiveis = await fetch("http://localhost:3005/api/chamados/disponiveis", { headers: { Authorization: `Bearer ${token}` } });
      setChamadosDisponiveis(await resDisponiveis.json());
    } catch (err) {
      console.error(err);
      setMessage("Erro ao assumir chamado");
    }
  };

  // Atualiza status do chamado
  const atualizarChamado = async () => {
    if (!selectedChamadoId) return;

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: novoStatus, usuario_id: tecnicoId }),
      });
      const data = await res.json();
      setMessage(data.message || "Chamado atualizado!");

      await atualizarMeusChamados();
    } catch (err) {
      console.error(err);
      setMessage("Erro ao atualizar chamado");
    }
  };

  // Criar apontamento
  const criarApontamento = async () => {
    if (!selectedChamadoId || !descricaoApontamento || !comeco || !fimatendimento) {
      setApontamentoMessage("Preencha todos os campos do apontamento!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3005/api/apontamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          chamado_id: Number(selectedChamadoId),
          tecnico_id: tecnicoId,
          descricao: descricaoApontamento,
          comeco,
          fimatendimento
        }),
      });
      const data = await res.json();
      setApontamentoMessage(data.message || "Apontamento registrado!");

      // Limpa campos
      setDescricaoApontamento("");
      setComeco("");
      setFimAtendimento("");

      // Atualiza histórico local
      setHistorico(prev => [
        ...prev,
        { id: data.id || Date.now(), descricao: descricaoApontamento }
      ]);

    } catch (err) {
      console.error(err);
      setApontamentoMessage("Erro ao registrar apontamento");
    }
  };

  return (
    <main className="p-6 bg-black min-h-screen">
      <h1 className="text-3xl font-bold mt-10 text-center text-gray-400 underline">Painel do Técnico</h1>

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
              <button className="bg-red-900 text-gray-300 px-3 py-1 rounded mt-2" onClick={() => assumirChamado(c.id)}>Assumir</button>
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
            {/* Status */}
            <label className="block mb-1 text-red-900">Status:</label>
            <select className="border rounded p-2 w-full bg-gray-500 text-red-900 mb-2" value={novoStatus} onChange={e => setNovoStatus(e.target.value)}>
              <option value="">-- Selecione --</option>
              <option value="pendente">Pendente</option>
              <option value="em andamento">Em andamento</option>
              <option value="concluído">Concluído</option>
            </select>
            <button className="bg-red-900 text-gray-400 px-4 py-2 rounded hover:bg-red-600 mb-4" onClick={atualizarChamado}>Atualizar</button>

            {message && <p className="mt-2 text-sm text-red-800 bg-gray-400 p-1 rounded">{message}</p>}

            {/* Formulário apontamento */}
            <div className="mt-4 border-t border-gray-700 pt-4">
              <h3 className="font-semibold mb-2 text-red-900">Registrar Apontamento</h3>
              <textarea className="w-full p-2 mb-2 rounded bg-gray-600 text-red-900" placeholder="Descrição" value={descricaoApontamento} onChange={e => setDescricaoApontamento(e.target.value)} />
              <input type="datetime-local" className="w-full p-2 mb-2 rounded bg-gray-600 text-red-900" value={comeco} onChange={e => setComeco(e.target.value)} />
              <input type="datetime-local" className="w-full p-2 mb-2 rounded bg-gray-600 text-red-900" value={fimatendimento} onChange={e => setFimAtendimento(e.target.value)} />
              <button className="bg-red-900 text-gray-300 px-4 py-2 rounded hover:bg-red-600" onClick={criarApontamento}>Registrar Apontamento</button>
              {apontamentoMessage && <p className="mt-2 text-sm text-red-800 bg-gray-400 p-1 rounded">{apontamentoMessage}</p>}
            </div>

            {/* Histórico */}
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
