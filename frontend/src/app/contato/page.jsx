'use client';

import { useEffect, useState } from "react";

export default function Contato() {
  const [tecnicos, setTecnicos] = useState([]);
  const [token, setToken] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAutenticado"));
    if (!usuario) return;

    setToken(usuario.token);

    // Busca técnicos ativos
    fetch("http://localhost:3005/api/usuarios?role=tecnico", {
      headers: { Authorization: `Bearer ${usuario.token}` },
    })
      .then(res => res.json())
      .then(data => setTecnicos(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tecnicoSelecionado || !mensagem) return alert("Preencha todos os campos");

    try {
      const res = await fetch("http://localhost:3005/api/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tecnico_id: tecnicoSelecionado, mensagem }),
      });

      const data = await res.json();
      alert(data.message);
      setMensagem("");
      setTecnicoSelecionado("");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar mensagem");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900">
      <div className="bg-black rounded-2xl shadow-lg px-12 py-16 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-400">Precisa de ajuda?</h1>
        <h2 className="text-lg text-center mb-8 text-gray-400">Envie uma mensagem para um técnico</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col text-gray-400 font-medium">
            Técnico:
            <select
              className="mt-2 p-3 rounded-lg bg-gray-700 text-gray-100"
              value={tecnicoSelecionado}
              onChange={e => setTecnicoSelecionado(e.target.value)}
              required
            >
              <option value="">-- Selecione um técnico --</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-gray-400 font-medium">
            Mensagem:
            <textarea
              className="mt-2 p-3 rounded-lg bg-gray-700 text-gray-100"
              rows="5"
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
          >
            Enviar Mensagem
          </button>
        </form>
      </div>
    </div>
  );
}
