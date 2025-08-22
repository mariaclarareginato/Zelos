"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const dados = localStorage.getItem("usuarioAutenticado");
    if (dados) {
      setUsuarioAutenticado(JSON.parse(dados));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuarioAutenticado");
    setUsuarioAutenticado(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const getNomeUsuario = () => {
    if (!usuarioAutenticado) return "";
    // Se tiver nome vindo do backend, use aqui:
    if (usuarioAutenticado.nome) return usuarioAutenticado.nome;
    // Caso contrário, mostra só o prefixo do e-mail
    return usuarioAutenticado.email?.split("@")[0] || "";
  };

  return (
    <nav className="bg-red-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 flex-wrap">
          {/* Logo + Nome */}
          <div className="flex items-center gap-4">
            <img
              src="imgs//logo.png"
              alt="Logo SENAI"
              className="h-10 w-auto object-contain"
            />
            <p className="text-lg sm:text-2xl font-bold text-gray-400 leading-tight hover:text-gray-500">
              Armando de Arruda Pereira
            </p>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {usuarioAutenticado ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 text-gray-400 font-semibold"
                >
                  <span>Olá, {getNomeUsuario()}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-red-950 rounded-md shadow-lg z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-400 bg-red-950"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-red-950 rounded text-gray-400 font-bold"
                >
                  Entrar
                </Link>
                <Link
                  href="/" // aqui corrigi, antes era /cadastro
                  className="px-4 py-2 bg-red-950 rounded text-gray-400 font-bold"
                >
                  Cadastre-se
                </Link>
              </>
            )}
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-200 hover:text-white"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {usuarioAutenticado ? (
            <>
              <div className="text-center font-semibold py-2 text-gray-400">
                Olá, {getNomeUsuario()}
              </div>
              <button
                onClick={handleLogout}
                className="block w-full bg-red-950 text-gray-400 font-bold py-2 rounded-md text-center"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block w-full bg-red-950 text-gray-200 font-bold py-2 rounded-md text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/" // corrigido aqui também
                className="block w-full bg-red-950 text-gray-200 font-bold py-2 rounded-md text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cadastre-se
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
