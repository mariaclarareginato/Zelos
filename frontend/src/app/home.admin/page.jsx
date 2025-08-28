'use client';

import { useEffect, useState } from "react";

export default function HomeAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [token, setToken] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const [editUsuario, setEditUsuario] = useState(null);
  const [editChamado, setEditChamado] = useState(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));
    if (usuario) setToken(usuario.token);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchUsuarios();
    fetchChamados();
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

  // ---------- Usuários ----------
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
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao deletar usuário");
    }
  };

  // ---------- Chamados ----------
  const atualizarChamado = async () => {
    if (!editChamado) return;
    const { id, titulo, descricao, status, tecnico_id } = editChamado;

    try {
      const res = await fetch(`http://localhost:3005/api/chamados/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ titulo, descricao, status, tecnico_id, usuario_id: editChamado.usuario_id })
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
    <main className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-5xl font-extrabold text-red-500 text-center mb-12 drop-shadow-lg">Painel do Administrador</h1>

      {mensagem && <p className="text-center text-red-400 mb-4">{mensagem}</p>}

       {/* --------- CHAMADOS --------- */}
      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Chamados</h2>
        <div className="overflow-x-auto">
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
                <tr key={c.id} className="border-b border-gray-700">
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
                      <input
                        type="number"
                        className="p-1 bg-gray-600 text-gray-100 rounded w-full"
                        value={editChamado.tecnico_id || ""}
                        onChange={e => setEditChamado({ ...editChamado, tecnico_id: Number(e.target.value) })}
                      />
                    ) : c.tecnico || "-"}
                  </td>
                  <td className="p-2 space-x-2">
                    {editChamado?.id === c.id ? (
                      <>
                        <button onClick={atualizarChamado} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Salvar</button>
                        <br></br><br></br>
                        <button onClick={() => setEditChamado(null)} className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditChamado(c)} className="bg-red-900 px-3 py-1 rounded hover:bg-red-800">Editar</button>
                        <br></br><br></br>
                        <button onClick={() => deletarChamado(c.id)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Deletar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --------- USUÁRIOS --------- */}
      <section className="mb-12">
        <h2 className="text-3xl text-gray-200 mb-6 text-center font-semibold">Usuários</h2>
        <div className="overflow-x-auto">
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
                  <td className="p-2 space-x-2">
                    {editUsuario?.id === u.id ? (
                      <>
                        <button onClick={atualizarUsuario} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Salvar</button>
                        <br></br><br></br>
                        <button onClick={() => setEditUsuario(null)} className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditUsuario(u)} className="bg-red-900 px-3 py-1 rounded hover:bg-red-800">Editar</button>
                         <br></br><br></br>
                        <button onClick={() => deletarUsuario(u.id)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Deletar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

     
    </main>
  );
}
