"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function HomeTecnico() {
  const [disponiveis, setDisponiveis] = useState([]);
  const [meusChamados, setMeusChamados] = useState([]);
  const tecnicoId = 2; 

  // carregar chamados
  useEffect(() => {
    axios.get("http://localhost:3005/api/chamados/disponiveis").then(res => setDisponiveis(res.data));
    axios.get(`http://localhost:3005/api/chamados/tecnico/${tecnicoId}`).then(res => setMeusChamados(res.data));
  }, []);

  // assumir chamado
  const assumirChamado = async (id) => {
    await axios.post(`http://localhost:3005/api/chamados/assumir/${id}`, { tecnico_id: tecnicoId });
    alert("Chamado assumido!");
    window.location.reload();
  };

  // criar apontamento
  const criarApontamento = async (id) => {
    const descricao = prompt("Descreva o atendimento:");
    const comeco = new Date().toISOString().slice(0, 19).replace("T", " ");
    const fimatendimento = new Date().toISOString().slice(0, 19).replace("T", " ");
    await axios.post("http://localhost:3005/api/apontamentos", {
      chamado_id: id,
      tecnico_id: tecnicoId,
      descricao,
      comeco,
      fimatendimento,
    });
    alert("Apontamento criado!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Painel do Técnico</h1>

      {/* Chamados disponíveis */}
      <h2 className="text-xl mt-4">📋 Chamados disponíveis</h2>
      {disponiveis.length === 0 ? (
        <p>Nenhum chamado disponível.</p>
      ) : (
        disponiveis.map((c) => (
          <div key={c.id} className="border p-3 rounded mb-2">
            <h3 className="font-semibold">{c.titulo}</h3>
            <p>{c.descricao}</p>
            <button
              onClick={() => assumirChamado(c.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
            >
              Assumir
            </button>
          </div>
        ))
      )}

      {/* Meus chamados */}
      <h2 className="text-xl mt-6">🛠️ Meus chamados</h2>
      {meusChamados.length === 0 ? (
        <p>Você não tem chamados em andamento.</p>
      ) : (
        meusChamados.map((c) => (
          <div key={c.id} className="border p-3 rounded mb-2">
            <h3 className="font-semibold">{c.titulo} ({c.status})</h3>
            <p>{c.descricao}</p>
            <button
              onClick={() => criarApontamento(c.id)}
              className="bg-green-500 text-white px-3 py-1 rounded mt-2"
            >
              Criar Apontamento
            </button>
          </div>
        ))
      )}
    </div>
  );
}
