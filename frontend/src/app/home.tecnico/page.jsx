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
      <br></br>
      <h1 className="text-center text-3xl font-bold mt-20 text-gray-400">Painel do Técnico</h1>

      {/* Chamados disponíveis */}
      <br></br>
      <h2 className="text-xl mt-4 text-center text-gray-400">Chamados disponíveis: </h2>
      {disponiveis.length === 0 ? (
        <p className="text-center text-red-400">Nenhum chamado disponível.</p>
      ) : (
        disponiveis.map((c) => (
          <div key={c.id} className="border p-3 rounded mb-2">
            <h3 className="font-semibold">{c.titulo}</h3>
            <p>{c.descricao}</p>
            <button
              onClick={() => assumirChamado(c.id)}
              className="bg-red-900 text-gray-300 px-3 py-1 rounded mt-2"
            >
              Assumir
            </button>
          </div>
        ))
      )}

      {/* Meus chamados */}

      <br></br><br></br>
      <h2 className="text-xl mt-6 text-center text-gray-400">Meus chamados</h2>
      {meusChamados.length === 0 ? (
        <p className="text-center text-red-400">Você não tem chamados em andamento.</p>
      ) : (
        meusChamados.map((c) => (
          <div key={c.id} className="border p-3 rounded mb-2">
            <h3 className="font-semibold">{c.titulo} ({c.status})</h3>
            <p>{c.descricao}</p>

            <button
              onClick={() => criarApontamento(c.id)}
              className="bg-red-900 text-gray-400 px-3 py-1 rounded mt-2"
            >
              Criar Apontamento
            </button>
          </div>
        ))
      )}
    </div>
  );
}
