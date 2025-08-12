"use client";

import { useEffect, useState } from "react";

export default function HomeAdmin() {
  const [chamados, setChamados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedChamadoId, setSelectedChamadoId] = useState("");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [selectedTecnicoId, setSelectedTecnicoId] = useState("");
  const [historico, setHistorico] = useState([]);
  const [message, setMessage] = useState("");
  const usuarioLogadoId = 1; // Simula usuário logado

  useEffect(() => {
    async function fetchData() {
      try {
        const [resChamados, resTecnicos] = await Promise.all([
          fetch("http://localhost:3005/api/chamados"),
          fetch("http://localhost:3005/api/usuarios?role=tecnico"),
        ]);
        const chamadosData = await resChamados.json();
        const tecnicosData = await resTecnicos.json();

        setChamados(chamadosData);
        setTecnicos(tecnicosData);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedChamadoId) {
      setHistorico([]);
      setNovoTitulo("");
      setNovoStatus("");
      setSelectedTecnicoId("");
      return;
    }

    const chamado = chamados.find((c) => c.id === Number(selectedChamadoId));
    if (chamado) {
      setNovoTitulo(chamado.titulo || "");
      setNovoStatus(chamado.status || "");
      const tecnico = tecnicos.find((t) => t.nome === chamado.tecnico);
      setSelectedTecnicoId(tecnico ? tecnico.id : "");
    }

    async function fetchHistorico() {
      try {
        const res = await fetch(
          `http://localhost:3005/api/chamados/historico/${selectedChamadoId}`
        );
        const data = await res.json();
        setHistorico(data);
      } catch (error) {
        console.error(error);
        setHistorico([]);
      }
    }
    fetchHistorico();
  }, [selectedChamadoId, chamados, tecnicos]);

  async function atualizarChamado() {
    if (!selectedChamadoId) {
      setMessage("Selecione um chamado");
      return;
    }

    const dados = {
      usuario_id: usuarioLogadoId,
      titulo: novoTitulo,
      status: novoStatus,
      tecnico_id: selectedTecnicoId || null,
    };

    try {
      const res = await fetch(
        `http://localhost:3005/api/chamados/${selectedChamadoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        }
      );
      const data = await res.json();
      setMessage(data.message || "Atualizado com sucesso");

      // Atualiza lista e histórico
      const chamadosRes = await fetch("http://localhost:3005/api/chamados");
      setChamados(await chamadosRes.json());

      const historicoRes = await fetch(
        `http://localhost:3005/api/chamados/historico/${selectedChamadoId}`
      );
      setHistorico(await historicoRes.json());
    } catch (error) {
      console.error(error);
      setMessage("Erro ao atualizar");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Chamados</h1>

      <select
        value={selectedChamadoId}
        onChange={(e) => setSelectedChamadoId(e.target.value)}
      >
        <option value="">-- Selecione um chamado --</option>
        {chamados.map((c) => (
          <option key={c.id} value={c.id}>
            {c.titulo}
          </option>
        ))}
      </select>

      {selectedChamadoId && (
        <>
          <div>
            <label>
              Título:{" "}
              <input
                type="text"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              Status:{" "}
              <select
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
              >
                <option value="">-- Selecione --</option>
                <option value="pendente">Pendente</option>
                <option value="em andamento">Em andamento</option>
                <option value="concluído">Concluído</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Técnico:{" "}
              <select
                value={selectedTecnicoId}
                onChange={(e) => setSelectedTecnicoId(e.target.value)}
              >
                <option value="">-- Sem técnico --</option>
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button onClick={atualizarChamado}>Atualizar Chamado</button>

          <h2>Histórico do Chamado</h2>
          <ul>
            {historico.map((h) => (
              <li key={h.id}>
                [{h.criado_em}] <b>{h.usuario}</b>: {h.acao}
              </li>
            ))}
          </ul>

          {message && <p>{message}</p>}
        </>
      )}
    </main>
  );
}
