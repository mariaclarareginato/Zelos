import React from "react";

const Contato = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 drop-shadow-[0_10px_25px_rgba(220,38,38,0.5)]">
      <div className="bg-black rounded-2xl shadow-lg px-14 py-16 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-400">
          Precisa de ajuda?
        </h1>
        <h2 className="text-lg text-center mb-12 opacity-90 text-gray-400">
          Quer mandar alguma mensagem para nós?
        </h2>

        <form className="form-contato flex flex-col gap-8">
          <label className="flex flex-col font-medium text-base text-gray-400">
            Nome:
            <input
              type="text"
              name="nome"
              required
              className="mt-2 p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />
          </label>

          <label className="flex flex-col font-medium text-base text-gray-400">
            E-mail:
            <input
              type="email"
              name="email"
              required
              className="mt-2 p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />
          </label>

          <label className="flex flex-col font-medium text-base text-gray-400">
            Mensagem:
            <textarea
              name="mensagem"
              rows="5"
              required
              className="mt-2 p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />
          </label>

          <div className="flex justify-center">
            <button
              type="submit"
              className="text-gray-400 bg-red-950 py-4 px-16 rounded-xl text-lg font-semibold w-72 hover:bg-red-900 transition"
            >
              Enviar
            </button>
            
          </div>

        </form>
        <br></br>
      </div>
    </div>
  );
};

export default Contato;