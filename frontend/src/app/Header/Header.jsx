"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const dados = JSON.parse(localStorage.getItem('usuarioAutenticado'));
        setUsuarioAutenticado(dados);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('usuarioAutenticado');
        setUsuarioAutenticado(null);
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        router.push('/');
    };

    const getNomeUsuario = () => {
        if (!usuarioAutenticado?.email) return '';
        return usuarioAutenticado.email.split('@')[0];
    };

    return (
        <nav className="bg-red-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* Logo + Nome */}
                    <div className="flex items-center gap-20">
                        <img
                            src="logo.png"
                            alt="Logo SENAI"
                            className="h-10 w-auto object-contain"
                        />
                        <p className="text-2xl font-bold text-gray-300">
                            Armando de Arruda Pereira
                        </p>
                    </div>

                    {/* Desktop Area do usuário */}
                    <div className="items-center gap-2">
                        {usuarioAutenticado ? (
                            <div className="relative inline-block text-left">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-1 bg-red-900 text-white font-bold  px-4 rounded-lg"
                                >
                                    <span>Olá, {getNomeUsuario()}</span>
                                    <svg
                                        className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                        >
                                            Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Link
                                    href="/login"
                                    className="bg-white text-red-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href="/cadastro"
                                    className="bg-white text-red-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition"
                                >
                                    Cadastre-se
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white hover:text-gray-300"
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

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden px-4 pt-2 pb-4">
                    {usuarioAutenticado ? (
                        <>
                            <div className="text-center font-semibold py-2">
                                Olá, {getNomeUsuario()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="block w-full bg-white text-red-800 font-bold py-2 mt-2 rounded-md text-center hover:bg-gray-100 transition"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="block bg-white text-red-700 font-bold py-2 mt-2 rounded-md text-center hover:bg-gray-100 transition"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/cadastro"
                                className="block bg-white text-red-700 font-bold py-2 mt-2 rounded-md text-center hover:bg-gray-100 transition"
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
