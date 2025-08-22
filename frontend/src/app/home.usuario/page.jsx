// Painel usuário


"use client";

import { useState, useEffect } from "react";

export default function PainelUsuario() {
  const usuarioLogadoId = 1; // ID fixo só para teste

  const [meusChamados, setMeusChamados] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioLogadoId}`)
      .then((res) => res.json())
      .then(setMeusChamados)
      .catch(() => setMeusChamados([]));
  }, []);

  async function criarChamado(e) {
    e.preventDefault();
    if (!titulo || !descricao || !tipoId) {
      setMensagem("Preencha todos os campos!");
      return;
    }
    const res = await fetch("http://localhost:3005/api/chamados/novo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        descricao,
        tipo_id: tipoId,
        usuario_id: usuarioLogadoId,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMensagem(data.message);
      setTitulo("");
      setDescricao("");
      setTipoId("");
      // Atualizar lista
      fetch(`http://localhost:3005/api/chamados/meus-chamados/${usuarioLogadoId}`)
        .then((res) => res.json())
        .then(setMeusChamados);
    } else {
      setMensagem(data.error || "Erro ao criar chamado");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1 className="text-center text-3xl font-bold mt-20 text-gray-400">Painel do Usuário</h1>

<br></br>
      <section>
        <h2 className="text-xl mt-4 text-center text-gray-400" >Abrir chamado: </h2>
       
       
        <form onSubmit={criarChamado}>
          <div>
            <label >
              Título:{" "}

              <input
                type="text"
                value={titulo}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-450 text-center"
                onChange={(e) => setTitulo(e.target.value)}
              />
            </label>
          </div>


          <br></br>
          <div>
            <label>
              Descrição:{" "}
              <textarea
                value={descricao}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-450 text-center"
                onChange={(e) => setDescricao(e.target.value)}
              />
            </label>
          </div>



<br></br>
          <div>
            <label>
              (ID):{" "}
              <input
                type="number"
                value={tipoId}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-450 text-center"
                onChange={(e) => setTipoId(e.target.value)}
                min="1"
              />
            </label>
          </div>



          <br></br>

          <div className="flex flex-col items-center space-y-3 text-sm border border-red-900 rounded-md p-3 hover:border-red-600">
  <button 
    type="submit"
    className="inline-block text-red-800 hover:text-red-600 font-medium transition duration-200"
  >
    Criar Chamado +
  </button>
</div>
<br></br>



        </form>

        {mensagem && <p>{mensagem}</p>}

      </section>



      <br></br><br></br><br></br>

      <section>
        <h2 className="text-xl mt-4 text-center text-gray-400">Meus Chamados</h2>
        {meusChamados.length === 0 && <p className="text-center text-red-400" >Você não tem chamados.</p>}
        <ul>
          {meusChamados.map((chamado) => (
            <li key={chamado.id}>
              <b>{chamado.titulo}</b> — Status: {chamado.status} — Técnico:{" "}
              {chamado.tecnico || "Não atribuído"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
