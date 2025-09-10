'use client';

// Importações

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import logo from "../../../public/imgs/logo.png"; 
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
 
} from "recharts";

export default function HomeAdmin() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [token, setToken] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const [editUsuario, setEditUsuario] = useState(null);
  const [editChamado, setEditChamado] = useState(null);
  const [historico, setHistorico] = useState({});
  const [historicoAberto, setHistoricoAberto] = useState({});

  // Filtro de período
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Ref para exportação
  const relatorioRef = useRef();

  // ---------- LOGIN ----------
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));

    if (!usuario) {
      router.push("/");
      return;
    }

    setToken(usuario.token);

    const email = usuario.email?.toLowerCase() || "";
    const isAdmin = email.endsWith("@administradorsenai.com");

    if (!isAdmin) {
      router.push("/home");
      return;
    }
  }, [router]);

  // ---------- FETCH ----------
  useEffect(() => {
    if (!token) return;
    fetchUsuarios();
    fetchChamados();
    fetchTecnicos();
  }, [token]);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3005/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChamados = async () => {
    try {
      const res = await fetch("http://localhost:3005/api/chamados", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChamados(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTecnicos = async () => {
    try {
      const res = await fetch("http://localhost:3005/api/usuarios?role=tecnico", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTecnicos(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistorico = async (chamadoId) => {
    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${chamadoId}/historico`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistorico(prev => ({ ...prev, [chamadoId]: data }));
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- USUÁRIOS ----------
  const atualizarUsuario = async () => {
    if (!editUsuario) return;
    const { id, nome, email, funcao, status } = editUsuario;

    try {
      const res = await fetch(`http://localhost:3005/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, email, funcao, status })
      });
      const data = await res.json();
      setMensagem(data.message || "Usuário atualizado!");
      setEditUsuario(null);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao atualizar usuário");
    }
  };

  const deletarUsuario = async (id) => {
    if (!confirm("Deseja realmente deletar este usuário?")) return;

    try {
      const res = await fetch(`http://localhost:3005/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMensagem(data.message || "Usuário deletado!");
      fetchUsuarios();
      fetchTecnicos();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao deletar usuário");
    }
  };

  // ---------- CHAMADOS ----------
  const atualizarChamado = async () => {
    if (!editChamado) return;
    const { id, titulo, descricao, status, tecnico_id, usuario_id } = editChamado;

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ titulo, descricao, status, tecnico_id, usuario_id })
      });
      const data = await res.json();
      setMensagem(data.message || "Chamado atualizado!");
      setEditChamado(null);
      fetchChamados();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao atualizar chamado");
    }
  };

  const deletarChamado = async (id) => {
    if (!confirm("Deseja realmente deletar este chamado?")) return;

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/excluir/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMensagem(data.message || "Chamado deletado!");
      fetchChamados();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao deletar chamado");
    }
  };

  // ---------- RELATÓRIOS ----------

  const chamadosFiltrados = chamados.filter(c => {
    if (dataInicio && new Date(c.criado_em) < new Date(dataInicio)) return false;
    if (dataFim && new Date(c.criado_em) > new Date(dataFim)) return false;
    return true;
  });

  const chamadosPorStatus = [
    { name: "Pendente", value: chamadosFiltrados.filter(c => c.status === "pendente").length },
    { name: "Em andamento", value: chamadosFiltrados.filter(c => c.status === "em andamento").length },
    { name: "Concluído", value: chamadosFiltrados.filter(c => c.status === "concluído").length },
  ];

  const chamadosPorTecnico = tecnicos.map(t => ({
    name: t.nome,
    chamados: chamadosFiltrados.filter(c => c.tecnico_id === t.id).length
  }));

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];


  function fixColorsForCanvas(el) {
    const style = window.getComputedStyle(el);
  
    if (style.backgroundColor.includes("lab(")) {
      el.style.backgroundColor = "rgb(31,41,55)"; // bg-gray-800
    }
    if (style.color.includes("lab(")) {
      el.style.color = "rgb(239,68,68)"; // text-red-500
    }
  
    Array.from(el.children).forEach(fixColorsForCanvas);
  }
  

   // ---------- PDF ----------

   const exportarPDF = async () => {
    const input = relatorioRef.current;
    if (!input) return;
  
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    // ---------- LOGO ----------
    const imgLogo = new Image();
    imgLogo.src = logo.src;
    pdf.addImage(imgLogo, "PNG", 10, 10, 40, 12);
  
    // ---------- TÍTULO ----------
    pdf.setFontSize(18);
    pdf.text("Relatório Zelos", pageWidth / 2, 20, { align: "center" });
  
    // ---------- PERÍODO ----------
    pdf.setFontSize(12);
    pdf.text(`Período: ${dataInicio} - ${dataFim}`, pageWidth / 2, 28, { align: "center" });
  
    // ---------- GRÁFICOS ----------
    fixColorsForCanvas(input);
    let yPos = 40;
  
    const adicionarGrafico = async (selector) => {
      const div = input.querySelector(selector);
      if (!div) return 0;
  
      const canvas = await html2canvas(div, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
  
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 120; // largura do gráfico no PDF
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width * 0.7; 
      const xPos = (pageWidth - pdfWidth) / 2; // centraliza horizontalmente
  
      pdf.addImage(imgData, "PNG", xPos, yPos, pdfWidth, pdfHeight);
      return pdfHeight + 10; // retorna espaço ocupado
    };
  
    yPos += await adicionarGrafico("#graficoPizza");
    yPos += await adicionarGrafico("#graficoBarra");
  
    // ------------------- TABELAS -------------------
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text("Lista de Chamados", 10, 20);
  
    autoTable(pdf, {
      startY: 25,
      head: [["Título", "Descrição", "Status", "Técnico"]],
      body: chamados.map(c => [
        c.titulo,
        c.descricao,
        c.status,
        tecnicos.find(t => t.id === c.tecnico_id)?.nome || "-"
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [239,68,68], textColor: [255,255,255], fontStyle: "bold" },
      bodyStyles: { fillColor: [31,41,55], textColor: [229,231,235] },
      alternateRowStyles: { fillColor: [55,65,81] },
    });
  
    let finalY = pdf.lastAutoTable.finalY + 10;
    pdf.text("Lista de Usuários", 10, finalY);
  
    autoTable(pdf, {
      startY: finalY + 5,
      head: [["Nome", "Email", "Função", "Status"]],
      body: usuarios.map(u => [u.nome, u.email, u.funcao, u.status]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [239,68,68], textColor: [255,255,255], fontStyle: "bold" },
      bodyStyles: { fillColor: [31,41,55], textColor: [229,231,235] },
      alternateRowStyles: { fillColor: [55,65,81] },
    });
  
    pdf.save("relatorio_chamados.pdf");
  };
  
  
  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-6">
      <h1 className="text-3xl md:text-5xl font-extrabold text-red-500 text-center mb-8 drop-shadow-lg">
        Painel do Administrador
      </h1>

      {mensagem && <p className="text-center text-red-400 mb-4">{mensagem}</p>}

      {/* ---------------- CHAMADOS ---------------- */}
      <section className="mb-12 gap-4">
        <h2 className="hidden md:block text-3xl text-gray-400 mb-6 text-center font-semibold">Chamados</h2>

        {/* Tabela Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-gray-200 bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3">Título</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Técnico</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {chamados.map(c => (
                <React.Fragment key={c.id}>
                  <tr className="border-b border-gray-700">
                    <td className="p-2">
                      {editChamado?.id === c.id ? (
                        <input
                          className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                          value={editChamado.titulo}
                          onChange={e => setEditChamado({ ...editChamado, titulo: e.target.value })}
                        />
                      ) : c.titulo}
                    </td>
                    <td className="p-2">
                      {editChamado?.id === c.id ? (
                        <textarea
                          className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                          value={editChamado.descricao}
                          onChange={e => setEditChamado({ ...editChamado, descricao: e.target.value })}
                        />
                      ) : c.descricao}
                    </td>
                    <td className="p-2">
                      {editChamado?.id === c.id ? (
                        <select
                          className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                          value={editChamado.status}
                          onChange={e => setEditChamado({ ...editChamado, status: e.target.value })}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="em andamento">Em andamento</option>
                          <option value="concluído">Concluído</option>
                        </select>
                      ) : c.status}
                    </td>
                   <td className="p-2">
                {editChamado?.id === c.id ? (
                 <select
                 className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                 value={editChamado.tecnico_id ?? ""} 
                 onChange={(e) =>
                 setEditChamado({
                 ...editChamado,
                 tecnico_id: e.target.value === "" ? null : Number(e.target.value),
                 })
                 }
                 >
                     <option value="">-- Sem técnico --</option>
                     {tecnicos.map((t) => (
                     <option key={t.id} value={t.id}>
                     {t.nome} (ID {t.id})
                     </option>
                      ))}
                     </select>
                     ) : c.tecnico || "-"}
                     </td>

                    <td className="p-2 flex flex-wrap gap-2">
                      {editChamado?.id === c.id ? (
                        <>
                          <button onClick={atualizarChamado} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Salvar</button>
                          <button onClick={() => setEditChamado(null)} className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditChamado(c)} className="bg-red-900 px-3 py-1 rounded hover:bg-red-800">Editar</button>
                          <button onClick={() => deletarChamado(c.id)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Deletar</button>
                          <button
                            onClick={() => {
                              if (!historico[c.id]) fetchHistorico(c.id);
                              setHistoricoAberto(prev => ({ ...prev, [c.id]: !prev[c.id] }));
                            }}
                            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                          >
                            Histórico
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Histórico */}
                  {historicoAberto[c.id] && (
                    <tr>
                      <td colSpan="5" className="bg-gray-800 p-4 rounded-b-2xl">
                        <h3 className="font-semibold text-gray-100 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Histórico do Chamado
                        </h3>

                        {historico[c.id] && historico[c.id].length > 0 ? (
                          <ul className="space-y-3">
                            {historico[c.id].map((h) => (
                              <li
                                key={h.id}
                                className="relative pl-6 border-l-2 border-red-600"
                              >
                                <span className="absolute -left-[6px] top-1 w-3 h-3 bg-red-600 rounded-full"></span>
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-200 font-semibold">
                                    {h.usuario}
                                  </span>
                                  <span className="text-sm text-red-300">{h.acao}</span>
                                  <span className="text-xs text-gray-400 mt-1">
                                    {h.criado_em}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">Sem histórico para esse chamado no momento.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
             
            </tbody>
          </table>
        </div>
        </section>

        
{/* ---------------- USUÁRIOS ---------------- */}
<section className="mb-12 gap-10">
  <h2 className="hidden md:block text-3xl text-gray-400 mb-6 text-center font-semibold">Usuários</h2>

  {/* Tabela Desktop */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full text-gray-200 bg-gray-800 rounded-lg overflow-hidden">
      <thead className="bg-gray-700">
        <tr>
          <th className="p-3">Nome</th>
          <th>Email</th>
          <th>Função</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map(u => (
          <tr key={u.id} className="border-b border-gray-700">
            <td className="p-2">
              {editUsuario?.id === u.id ? (
                <input
                  className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                  value={editUsuario.nome}
                  onChange={e => setEditUsuario({ ...editUsuario, nome: e.target.value })}
                />
              ) : u.nome}
            </td>
            <td className="p-2">
              {editUsuario?.id === u.id ? (
                <input
                  className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                  value={editUsuario.email}
                  onChange={e => setEditUsuario({ ...editUsuario, email: e.target.value })}
                />
              ) : u.email}
            </td>
            <td className="p-2">
              {editUsuario?.id === u.id ? (
                <select
                  className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                  value={editUsuario.funcao}
                  onChange={e => setEditUsuario({ ...editUsuario, funcao: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="tecnico">Técnico</option>
                  <option value="usuario">Usuário</option>
                </select>
              ) : u.funcao}
            </td>
            <td className="p-2">
              {editUsuario?.id === u.id ? (
                <select
                  className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                  value={editUsuario.status}
                  onChange={e => setEditUsuario({ ...editUsuario, status: e.target.value })}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              ) : u.status}
            </td>
            <td className="p-2 flex flex-wrap gap-2">
              {editUsuario?.id === u.id ? (
                <>
                  <button
                    onClick={atualizarUsuario}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditUsuario(null)}
                    className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditUsuario(u)}
                    className="bg-red-900 px-3 py-1 rounded hover:bg-red-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletarUsuario(u.id)}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>






  {/* Cards Mobile */}

  {/* Chamados */}

  <div className="grid gap-4 md:hidden">
    <h2 className="font-bold text-xl text-center text-gray-300">Chamados</h2>
  {chamados.map((c) => (
    <div key={c.id} className="bg-gray-800 rounded-lg p-4 shadow-md">
      <p>
        <span className="font-bold text-red-500">Título:</span>{" "}
        {editChamado?.id === c.id ? (
          <input
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editChamado.titulo}
            onChange={(e) => setEditChamado({ ...editChamado, titulo: e.target.value })}
          />
        ) : c.titulo}
      </p>

      <p>
        <span className="font-bold text-red-500">Descrição:</span>{" "}
        {editChamado?.id === c.id ? (
          <textarea
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editChamado.descricao}
            onChange={(e) => setEditChamado({ ...editChamado, descricao: e.target.value })}
          />
        ) : c.descricao}
      </p>

      <p>
        <span className="font-bold text-red-500">Status:</span>{" "}
        {editChamado?.id === c.id ? (
          <select
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editChamado.status}
            onChange={(e) => setEditChamado({ ...editChamado, status: e.target.value })}
          >
            <option value="aberto">Aberto</option>
            <option value="em andamento">Em andamento</option>
            <option value="concluído">Concluído</option>
          </select>
        ) : c.status}
      </p>

      <p>
        <span className="font-bold text-red-500">Técnico:</span>{" "}
        {editChamado?.id === c.id ? (
          <input
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editChamado.tecnico || ""}
            onChange={(e) => setEditChamado({ ...editChamado, tecnico: e.target.value })}
          />
        ) : c.tecnico || "-"}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {editChamado?.id === c.id ? (
          <>
            <button
              onClick={atualizarChamado}
              className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-sm"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditChamado(null)}
              className="bg-gray-500 px-2 py-1 rounded hover:bg-gray-600 text-sm"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditChamado(c)}
              className="bg-red-900 px-2 py-1 rounded hover:bg-red-800 text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => deletarChamado(c.id)}
              className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-sm"
            >
              Deletar
            </button>
            <button
              onClick={() => {
                if (!historico[c.id]) fetchHistorico(c.id);
                setHistoricoAberto((prev) => ({ ...prev, [c.id]: !prev[c.id] }));
              }}
              className="bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-sm"
            >
              Histórico
            </button>
          </>
        )}
      </div>

      {/* Histórico com rolagem se necessário */}
      {historicoAberto[c.id] && (
        <div className="mt-3 bg-gray-700 p-3 rounded max-h-[300px] overflow-y-auto">
          <h3 className="font-semibold text-gray-100 mb-2">Histórico</h3>
          {historico[c.id] && historico[c.id].length > 0 ? (
            <ul className="space-y-2">
              {historico[c.id].map((h) => (
                <li key={h.id} className="text-sm text-gray-300 border-b border-gray-600 pb-1">
                  <p>
                    <strong>{h.usuario}</strong> - {h.acao}
                  </p>
                  <p className="text-xs text-gray-400">{h.criado_em}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">Sem histórico disponível.</p>
          )}
        </div>
      )}
    </div>
  ))}
</div>


{/* Usuários */}

<div className="grid gap-4 md:hidden mt-6">
<h2 className="font-bold text-xl text-center text-gray-300">Usuários</h2>
  {usuarios.map((u) => (
    <div key={u.id} className="bg-gray-800 rounded-lg p-4 shadow-md">
      <p>
        <span className="font-bold">Nome:</span>{" "}
        {editUsuario?.id === u.id ? (
          <input
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editUsuario.nome}
            onChange={(e) => setEditUsuario({ ...editUsuario, nome: e.target.value })}
          />
        ) : u.nome}
      </p>

      <p>
        <span className="font-bold">Email:</span>{" "}
        {editUsuario?.id === u.id ? (
          <input
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editUsuario.email}
            onChange={(e) => setEditUsuario({ ...editUsuario, email: e.target.value })}
          />
        ) : u.email}
      </p>

      <p>
        <span className="font-bold">Função:</span>{" "}
        {editUsuario?.id === u.id ? (
          <input
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editUsuario.funcao}
            onChange={(e) => setEditUsuario({ ...editUsuario, funcao: e.target.value })}
          />
        ) : u.funcao}
      </p>

      <p>
        <span className="font-bold">Status:</span>{" "}
        {editUsuario?.id === u.id ? (
          <select
            className="p-1 bg-gray-600 text-gray-100 rounded w-full"
            value={editUsuario.status}
            onChange={(e) => setEditUsuario({ ...editUsuario, status: e.target.value })}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        ) : u.status}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {editUsuario?.id === u.id ? (
          <>
            <button
              onClick={atualizarUsuario}
              className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-sm"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditUsuario(null)}
              className="bg-gray-500 px-2 py-1 rounded hover:bg-gray-600 text-sm"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditUsuario(u)}
              className="bg-red-900 px-2 py-1 rounded hover:bg-red-800 text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => deletarUsuario(u.id)}
              className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-sm"
            >
              Deletar
            </button>
          </>
        )}
      </div>
    </div>
  ))}
</div>


{/* ---------------- RELATÓRIOS ---------------- */}
<section ref={relatorioRef} className="mb-12 px-4">
  <h2 className="text-2xl md:text-3xl text-red-500 mb-6 text-center font-semibold">
    Relatórios e Gráficos
  </h2>

  {/* Filtro de período */}
  <div className="flex flex-wrap gap-4 justify-center mb-6">
    <input
      type="date"
      value={dataInicio}
      onChange={e => setDataInicio(e.target.value)}
      className="bg-gray-800 text-red-500 p-2 rounded border-none"
    />
    <input
      type="date"
      value={dataFim}
      onChange={e => setDataFim(e.target.value)}
      className="bg-gray-800 text-red-500 p-2 rounded border-none"
    />
  </div>

  {/* Resumo */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    {chamadosPorStatus.map((s, i) => (
      <div
        key={i}
        className="bg-gray-800 p-6 rounded-2xl text-center"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
      >
        <h3 className="text-xl font-bold text-red-500">{s.name}</h3>
        <p className="text-3xl font-extrabold text-red-500 mt-2">{s.value}</p>
      </div>
    ))}
  </div>

  {/* Gráficos */}
  <div className="flex flex-wrap justify-center gap-10">
    
    {/* Pizza - Status */}

    <div id="graficoPizza" className="bg-gray-800 p-6 rounded-2xl text-center" style={{ width: 350 }}>
      <h3 className="text-lg font-semibold text-red-500 mb-4">Distribuição por Status</h3>
      <PieChart width={300} height={300}>
      

<Pie
  data={chamadosPorStatus}
  cx={150}
  cy={150}
  outerRadius={120}
  dataKey="value"
>
  {chamadosPorStatus.map((_, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
  ))}
</Pie>

        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #f33939" }}
          labelStyle={{ color: "#f33939" }}
          itemStyle={{ color: "#f33939" }}
        />
      </PieChart>

      {/* Legenda HTML simples */}
      <div className="flex justify-center flex-wrap mt-4 gap-2 text-red-500 text-sm">
        {chamadosPorStatus.map((s, i) => (
          <div key={i}>{`${s.name} (${s.value})`}</div>
        ))}
      </div>
    </div>

    {/* Barras - Técnicos */}

    <div id="graficoBarra" className="bg-gray-800 p-6 rounded-2xl text-center" style={{ width: 350 }}>
      <h3 className="text-lg font-semibold text-red-500 mb-4">Chamados por Técnico</h3>
      <BarChart width={300} height={300} data={chamadosPorTecnico}>
        <CartesianGrid stroke="none" />
        <XAxis dataKey="name" stroke="#f33939" tick={false}/>
        <YAxis stroke="#f33939" />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #f33939" }}
          labelStyle={{ color: "#f33939" }}
          itemStyle={{ color: "#f33939" }}
        />
        <Bar dataKey="chamados" fill="#f33939" />
      </BarChart>

      {/* Legenda HTML simples */}
      <div className="flex justify-center flex-wrap mt-4 gap-2 text-red-500 text-sm">
        {chamadosPorTecnico.map((t, i) => (
          <div key={i}>{`${t.name} (${t.chamados})`}</div>
        ))}
      </div>
    </div>

  </div>
</section>


{/* Botão PDF */}
<div className="text-center mb-12">
  <button
    onClick={exportarPDF}
    className="bg-red-600 hover:bg-red-700 text-gray-350 font-bold py-2 px-6 rounded-lg shadow-lg"
  >
    Salvar Relatório em PDF
  </button>
</div>

  
</section>
</main>

);

}

