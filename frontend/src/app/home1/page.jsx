"use client";
import { useState, useEffect } from "react";

export default function AdminHome() {
  const API_URL = "http://localhost:3004/api";
  const [chamados, setChamados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carregar chamados
  const carregarChamados = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/chamados`);
    const data = await res.json();
    setChamados(data);
    setLoading(false);
  };

  // Carregar técnicos
  const carregarTecnicos = async () => {
    const res = await fetch(`${API_URL}/tecnicos`);
    const data = await res.json();
    setTecnicos(data);
  };

  // Carregar histórico
  const carregarHistorico = async (id) => {
    const res = await fetch(`${API_URL}/apontamentos/${id}`);
    const data = await res.json();
    setHistorico(data);
    setModalOpen(true);
  };

  // Atribuir técnico
  const atribuirTecnico = async (idChamado, tecnicoId) => {
    if (!tecnicoId) return alert("Selecione um técnico!");
    const res = await fetch(`${API_URL}/chamados/${idChamado}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tecnicoId }),
    });

    if (res.ok) {
      alert("✅ Técnico atribuído com sucesso!");
      carregarChamados();
    } else {
      alert("❌ Erro ao atribuir técnico.");
    }
  };

  // Gerar CSV
  const gerarRelatorio = () => {
    const header = "ID,Título,Tipo,Status,Técnico\n";
    const rows = chamados
      .map(
        (c) =>
          `${c.id},"${c.titulo}","${c.tipo || ""}","${c.status}","${
            c.tecnico || ""
          }"`
      )
      .join("\n");

    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_chamados.csv";
    a.click();
  };

  useEffect(() => {
    carregarChamados();
    carregarTecnicos();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Aberto":
        return "bg-yellow-100 text-yellow-800";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800";
      case "Resolvido":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Painel do Administrador</h1>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={gerarRelatorio}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          📄 Gerar Relatório CSV
        </button>
        <button
          onClick={carregarChamados}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔄 Atualizar Lista
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500">⏳ Carregando...</div>
      ) : (
        <table className="w-full border border-gray-300 rounded overflow-hidden shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Título</th>
              <th className="border px-2 py-1">Tipo</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Técnico</th>
              <th className="border px-2 py-1">Atribuir</th>
              <th className="border px-2 py-1">Histórico</th>
            </tr>
          </thead>
          <tbody>
            {chamados.map((chamado) => (
              <tr key={chamado.id} className="hover:bg-gray-50 transition">
                <td className="border px-2 py-1">{chamado.id}</td>
                <td className="border px-2 py-1">{chamado.titulo}</td>
                <td className="border px-2 py-1">{chamado.tipo}</td>
                <td
                  className={`border px-2 py-1 font-semibold ${getStatusColor(
                    chamado.status
                  )}`}
                >
                  {chamado.status}
                </td>
                <td className="border px-2 py-1">{chamado.tecnico || "—"}</td>
                <td className="border px-2 py-1">
                  <select
                    onChange={(e) =>
                      atribuirTecnico(chamado.id, e.target.value)
                    }
                    defaultValue=""
                    className="border p-1 rounded"
                  >
                    <option value="">-- Selecione --</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => carregarHistorico(chamado.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal do histórico */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">📜 Histórico</h2>
            {historico.length > 0 ? (
              <ul className="space-y-3">
                {historico.map((h) => (
                  <li
                    key={h.id}
                    className="border p-2 rounded bg-gray-50 shadow-sm"
                  >
                    <p>
                      📅{" "}
                      {new Date(h.comeco).toLocaleString()} -{" "}
                      {new Date(h.fimatendimento).toLocaleString()}
                    </p>
                    <p>📝 {h.descricao}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sem histórico registrado.</p>
            )}
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
