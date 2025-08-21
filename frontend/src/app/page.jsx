'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Inputmask from 'inputmask';

export default function Cadastro() {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [csenha, setCsenha] = useState('');
  const [codigoAdmin, setCodigoAdmin] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
      Inputmask({ mask: '999.999.999-99', showMaskOnHover: false }).mask(cpfInput);
    }
  }, []);

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = 11 - (soma % 11); let dv1 = resto > 9 ? 0 : resto;
    if (dv1 !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = 11 - (soma % 11); let dv2 = resto > 9 ? 0 : resto;
    return dv2 === parseInt(cpf[10]);
  };

  const handleCPFChange = (e) => {
    const value = e.target.value;
    setCpf(value);
    if (!value.trim()) { setCpfError(''); return; }
    if (value.replace(/[^\d]/g, '').length === 11) {
      setCpfError(!validarCPF(value) ? 'CPF inválido' : '');
    }
  };

  const cadastrar = async (e) => {
    e.preventDefault();

    if (cpfError) { alert('Corrija o CPF antes de continuar.'); return; }
    if (!validarCPF(cpf)) { alert('CPF inválido.'); return; }
    if (senha !== csenha) { alert('As senhas não coincidem.'); return; }

    // Validação do código de admin
    if (codigoAdmin !== 'ADM-2025-SENAI') {
      alert('Código de administrador inválido.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3004/cadastro', {
        cpf: cpf.replace(/[^\d]/g, ''),
        email,
        senha,
        funcao: 'Administrador' // garante que será cadastrado como admin
      });
      alert(res.data.mensagem);
      router.push('/login');
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro no cadastro');
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-no-repeat z-0"></div>
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-gray/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-red-700 mb-3">
              Bem-vindo ao Zelos.
            </h1>
            <p className="text-lg text-center text-gray-600">
              Crie conta <span className="font-semibold text-red-800">SENAI Armando de Arruda Pereira</span>
            </p>
          </div>

          <form className="space-y-6" onSubmit={cadastrar}>
            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                id="cpf"
                type="text"
                className={`w-full px-4 py-3 border ${cpfError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${cpfError ? 'focus:ring-red-500' : 'focus:ring-red-500'} text-gray-700`}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                required
              />
              {cpfError && <p className="mt-1 text-sm text-red-600">{cpfError}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email institucional</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                placeholder="seu.email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}>👁️</button>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirme sua senha</label>
              <input
                type={mostrarConfirmSenha ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                placeholder="••••••••"
                value={csenha}
                onChange={(e) => setCsenha(e.target.value)}
                required
              />
              <button type="button" onClick={() => setMostrarConfirmSenha(!mostrarConfirmSenha)}>👁️</button>
            </div>

            {/* Código Admin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de Administrador</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                placeholder="Digite o código fornecido"
                value={codigoAdmin}
                onChange={(e) => setCodigoAdmin(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full bg-red-800 text-white py-3 rounded-lg hover:bg-red-600 transition duration-300">
              Criar conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
