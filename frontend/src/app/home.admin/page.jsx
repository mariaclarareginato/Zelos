'use client';

// Importações

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  // ---------- VERIFiCANDO LOGIN E EMAIL ----------

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));

    if (!usuario) {

      // não logado → redireciona login
      
      router.push("/");
      return;
    }

    setToken(usuario.token);

    const email = usuario.email?.toLowerCase() || "";
    const isAdmin = email.endsWith("@administradorsenai.com");

    if (!isAdmin) {
      // não admin → redireciona

      router.push("/home");
      return;
    }
  }, [router]);
  

  // ---------- FETCH EFFECT ----------

  useEffect(() => {
    if (!token) return;
    fetchUsuarios();
    fetchChamados();
    fetchTecnicos();
  }, [token]);

  // ---------- FETCH FUNCTIONS ----------
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

  

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-6">
      <h1 className="text-3xl md:text-5xl font-extrabold text-red-500 text-center mb-8 drop-shadow-lg">
        Painel do Administrador
      </h1>

      {mensagem && <p className="text-center text-red-400 mb-4">{mensagem}</p>}

      {/* ---------------- CHAMADOS ---------------- */}
      <section className="mb-12 gap-4">
        <h2 className="text-2xl md:text-3xl text-gray-200 mb-6 text-center font-semibold">Chamados</h2>

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
                    {/* Título */}
                    <td className="p-2">
                      {editChamado?.id === c.id ? (
                        <input
                          className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                          value={editChamado.titulo}
                          onChange={e => setEditChamado({ ...editChamado, titulo: e.target.value })}
                        />
                      ) : c.titulo}
                    </td>

                    {/* Descrição */}
                    <td className="p-2">
                      {editChamado?.id === c.id ? (
                        <textarea
                          className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                          value={editChamado.descricao}
                          onChange={e => setEditChamado({ ...editChamado, descricao: e.target.value })}
                        />
                      ) : c.descricao}
                    </td>

                    {/* Status */}
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

                    {/* Técnico */}
                    <td className="p-2">
                      {editChamado?.id === c.id ? (
                        <select
                          className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                          value={editChamado.tecnico_id || ""}
                          onChange={e => setEditChamado({ ...editChamado, tecnico_id: Number(e.target.value) })}
                        >
                          <option value="">-- Selecione Técnico --</option>
                          {tecnicos.map(t => (
                            <option key={t.id} value={t.id}>{t.nome} (ID {t.id})</option>
                          ))}
                        </select>
                      ) : c.tecnico || "-"}
                    </td>

                    {/* Ações */}
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
                      <td colSpan="5" className="bg-gray-700 p-3">
                        <h3 className="font-semibold text-gray-200 mb-2">Histórico</h3>
                        {historico[c.id] && historico[c.id].length > 0 ? (
                          <ul className="text-sm text-gray-300 space-y-1">
                            {historico[c.id].map(h => (
                              <li key={h.id}>
                                <span className="font-bold">{h.usuario}</span>: {h.acao}
                                <span className="text-xs text-gray-400 ml-2">{h.criado_em}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">Sem histórico para esse chamado no momento</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão mobile (cards) */}
        <div className="grid gap-4 md:hidden">
          {chamados.map(c => (
            <div key={c.id} className="bg-gray-800 rounded-lg p-4 shadow-md">
              <p><span className="font-bold">Título:</span> {c.titulo}</p>
              <p><span className="font-bold">Descrição:</span> {c.descricao}</p>
              <p><span className="font-bold">Status:</span> {c.status}</p>
              <p><span className="font-bold">Técnico:</span> {c.tecnico || "-"}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => setEditChamado(c)} className="bg-red-900 px-2 py-1 rounded hover:bg-red-800 text-sm">Editar</button>
                <button onClick={() => deletarChamado(c.id)} className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-sm">Deletar</button>
                <button
                  onClick={() => {
                    if (!historico[c.id]) fetchHistorico(c.id);
                    setHistoricoAberto(prev => ({ ...prev, [c.id]: !prev[c.id] }));
                  }}
                  className="bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Histórico
                </button>
              </div>

              {historico[c.id] && historicoAberto[c.id] && (
                <ul className="mt-3 text-sm text-gray-300 space-y-1">
                  {historico[c.id].map(h => (
                    <li key={h.id}>
                      <span className="font-bold">{h.usuario}</span>: {h.acao}
                      <span className="text-xs text-gray-400 ml-2">{h.criado_em}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      

      {/* ---------------- USUÁRIOS ---------------- */}
      <section className="mb-12 gap-10">
        <h2 className="text-2xl md:text-3xl text-gray-200 mb-6 text-center font-semibold">Usuários</h2>

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
                        <button onClick={atualizarUsuario} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Salvar</button>
                        <button onClick={() => setEditUsuario(null)} className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditUsuario(u)} className="bg-red-900 px-3 py-1 rounded hover:bg-red-800">Editar</button>
                        <button onClick={() => deletarUsuario(u.id)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Deletar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão mobile (cards) */}
        <div className="grid gap-4 md:hidden">
          {usuarios.map(u => (
            <div key={u.id} className="bg-gray-800 rounded-lg p-4 shadow-md">
              <p><span className="font-bold">Nome:</span> {u.nome}</p>
              <p><span className="font-bold">Email:</span> {u.email}</p>
              <p><span className="font-bold">Função:</span> {u.funcao}</p>
              <p><span className="font-bold">Status:</span> {u.status}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => setEditUsuario(u)} className="bg-red-900 px-2 py-1 rounded hover:bg-red-800 text-sm">Editar</button>
                <button onClick={() => deletarUsuario(u.id)} className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-sm">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

