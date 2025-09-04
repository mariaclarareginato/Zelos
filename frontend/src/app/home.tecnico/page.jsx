'use client';

// Importações
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeTecnico() {
  const router = useRouter();

  const [chamadosDisponiveis, setChamadosDisponiveis] = useState([]);
  const [meusChamados, setMeusChamados] = useState([]);
  const [selectedChamadoId, setSelectedChamadoId] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [historico, setHistorico] = useState([]);
  const [message, setMessage] = useState("");

  const [mensagens, setMensagens] = useState([]);
  const [resposta, setResposta] = useState("");

  const [token, setToken] = useState(null);
  const [tecnicoId, setTecnicoId] = useState(null);

  const [descricaoApontamento, setDescricaoApontamento] = useState("");
  const [comeco, setComeco] = useState("");
  const [fimAtendimento, setFimAtendimento] = useState("");
  const [apontamentoMessage, setApontamentoMessage] = useState("");

  // ---------- VERIFICAÇÃO LOGIN & EMAIL ----------
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));

    if (!usuario) return router.push("/");

    const email = usuario.email?.toLowerCase() || "";
    const isTecnico = email.endsWith("@tecnicosenai.com");

    if (!isTecnico) return router.push("/home");

    setToken(usuario.token);
    setTecnicoId(Number(usuario.id));
  }, [router]);

  // ---------- FETCH CHAMADOS ----------
  useEffect(() => {
    if (!token || !tecnicoId) return;

    async function fetchData() {
      try {
        const [resDisponiveis, resMeus] = await Promise.all([
          fetch("http://localhost:3005/api/chamados/disponiveis", { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:3005/api/chamados/tecnico/${tecnicoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setChamadosDisponiveis(await resDisponiveis.json());
        setMeusChamados(await resMeus.json());
      } catch (err) {
        console.error("Erro ao buscar chamados:", err);
      }
    }

    fetchData();
  }, [token, tecnicoId]);

  // ---------- FETCH MENSAGENS ----------
  const fetchMensagens = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3005/api/buscar/mensagens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensagens(await res.json());
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  };

  useEffect(() => {
    fetchMensagens();
  }, [token]);

  // ---------- FETCH HISTÓRICO ----------
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
        const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}/historico`, {
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

  // ---------- FUNÇÕES AUXILIARES ----------

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

  const atualizarStatusChamado = async () => {
    if (!selectedChamadoId || !novoStatus) return;

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${selectedChamadoId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: novoStatus }),
      });
      const data = await res.json();
      setMessage(data.message || "Status atualizado!");
      await atualizarMeusChamados();
    } catch (err) {
      console.error(err);
      setMessage("Erro ao atualizar status");
    }
  };

  const criarApontamento = async () => {
    if (!selectedChamadoId || !descricaoApontamento || !comeco || !fimAtendimento) {
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
          fim: fimAtendimento,
        }),
      });
      const data = await res.json();
      setApontamentoMessage(data.message || "Apontamento registrado!");
      setDescricaoApontamento("");
      setComeco("");
      setFimAtendimento("");
      setHistorico(prev => [...prev, { id: data.id || Date.now(), descricao: descricaoApontamento }]);
    } catch (err) {
      console.error(err);
      setApontamentoMessage("Erro ao registrar apontamento");
    }
  };

  const responderMensagem = async (id) => {
    if (!resposta) return alert("Digite uma resposta!");
    try {
      const res = await fetch(`http://localhost:3005/api/mensagens/${id}/responder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resposta }),
      });
      const data = await res.json();
      setResposta("");
      fetchMensagens();
      alert(data.message || "Resposta enviada!");
    } catch (err) {
      console.error(err);
      alert("Erro ao responder mensagem");
    }
  };

  const excluirMensagem = async (id) => {
    if (!confirm("Deseja realmente excluir esta mensagem?")) return;
    try {
      const res = await fetch(`http://localhost:3005/api/mensagens/${id}/tecnico`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      fetchMensagens();
      alert(data.message || "Mensagem excluída!");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir mensagem");
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <h1 className="text-5xl font-extrabold text-red-500 text-center mb-12 drop-shadow-lg">Painel do Técnico</h1>

      {/* Chamados Disponíveis */}
      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Chamados Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chamadosDisponiveis.length === 0 ? (
            <p className="text-center text-red-400 col-span-full">Nenhum chamado disponível</p>
          ) : (
            chamadosDisponiveis.map(c => (
              <div key={c.id} className="bg-gray-700 rounded-xl shadow-xl p-6 hover:scale-105 transform transition duration-300">
                <h3 className="text-red-400 font-bold text-xl mb-2">{c.titulo}</h3>
                <p className="text-gray-100 mb-4">{c.descricao}</p>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition duration-200 w-full"
                  onClick={() => assumirChamado(c.id)}
                >
                  Assumir
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Meus Chamados */}
      
      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Meus Chamados</h2>
        <div className="flex justify-center mb-6">
          <select
            className="w-full max-w-lg p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 shadow-md focus:ring-2 focus:ring-red-500"
            value={selectedChamadoId}
            onChange={e => setSelectedChamadoId(e.target.value)}
          >
            <option value="">-- Selecione um chamado --</option>
            {meusChamados.map(c => (
              <option key={c.id} value={c.id}>{c.titulo} ({c.status})</option>
            ))}
          </select>
        </div>

        {selectedChamadoId && (
          <div className="bg-gray-700 p-6 rounded-xl shadow-xl space-y-6">

            {/* Atualizar Status */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <label className="text-gray-200 font-semibold">Status:</label>
              <select
                className="flex-1 p-2 rounded-lg bg-gray-600 text-gray-100"
                value={novoStatus}
                onChange={e => setNovoStatus(e.target.value)}
              >
                <option value="">-- Selecione --</option>
                <option value="pendente">Pendente</option>
                <option value="em andamento">Em andamento</option>
                <option value="concluído">Concluído</option>
              </select>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition duration-200"
                onClick={atualizarStatusChamado}
              >
                Atualizar
              </button>
            </div>

            {message && <p className="bg-gray-600 text-red-200 p-2 rounded">{message}</p>}

            {/* Apontamentos */}
            <div className="border-t border-gray-600 pt-4 space-y-4">
              <h3 className="text-red-400 font-bold text-xl">Registrar Apontamento</h3>
              <textarea
                className="w-full p-3 rounded-lg bg-gray-600 text-gray-100 resize-none"
                placeholder="Descrição"
                value={descricaoApontamento}
                onChange={e => setDescricaoApontamento(e.target.value)}
              />
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="datetime-local"
                  className="flex-1 p-2 rounded-lg bg-gray-600 text-gray-100"
                  value={comeco}
                  onChange={e => setComeco(e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="flex-1 p-2 rounded-lg bg-gray-600 text-gray-100"
                  value={fimAtendimento}
                  onChange={e => setFimAtendimento(e.target.value)}
                />
              </div>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold w-full transition duration-200"
                onClick={criarApontamento}
              >
                Registrar Apontamento
              </button>
              {apontamentoMessage && <p className="bg-gray-600 text-red-200 p-2 rounded">{apontamentoMessage}</p>}
            </div>

            {/* Histórico */}
            <div className="mt-4">
              <h3 className="text-red-400 font-bold text-xl mb-2">Histórico</h3>
              <ul className="list-disc pl-5 text-gray-200 space-y-1">
                {historico.map(h => <li key={h.id}>{h.descricao || h.acao}</li>)}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Mensagens */}
      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Mensagens de usuários</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mensagens.length === 0 ? (
            <p className="text-center text-red-400 col-span-full">Nenhuma mensagem</p>
          ) : (
            mensagens.map(m => (
              <div key={m.id} className="bg-gray-700 rounded-xl shadow-xl p-6 hover:scale-105 transform transition duration-300">
                <p className="text-gray-200 mb-2"><strong>De:</strong> {m.usuario}</p>
                <p className="text-gray-100 mb-2">{m.mensagem}</p>
                {m.resposta && <p className="text-green-400 mb-2"><strong>Resposta:</strong> {m.resposta}</p>}

                {!m.resposta && (
                  <textarea
                    placeholder="Digite sua resposta..."
                    className="w-full p-2 rounded bg-gray-600 text-gray-100 mb-2 resize-none"
                    value={resposta}
                    onChange={e => setResposta(e.target.value)}
                  />
                )}

                <div className="flex gap-2">
                  {!m.resposta && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold w-full"
                      onClick={() => responderMensagem(m.id)}
                    >
                      Responder
                    </button>
                  )}
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold w-full"
                    onClick={() => excluirMensagem(m.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
