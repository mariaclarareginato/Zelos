'use client';

// Importações

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
    if (codigoAdmin !== 'ADM-2025-SENAI') { // SUPER SECRETO
      alert('Código de administrador inválido.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3004/cadastro', {
        cpf: cpf.replace(/[^\d]/g, ''),
        email,
        senha,
        funcao: 'Administrador' // Garante que só admin logue
      });
      alert(res.data.mensagem);
      router.push('/');
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

            <p className="text-lg text-center text-gray-500">
              Crie uma conta  
            </p>
            <span className="block text-center sm:text-left text-red-800 font-semibold text-lg sm:text-xl md:text-2xl leading-snug">
  SENAI<br />
  Armando de Arruda Pereira
</span>

            
          </div>
          <br></br>

          <form className="space-y-6" onSubmit={cadastrar}>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-450 mb-1">CPF</label>
              <input
                id="cpf"
                type="text"
                className={`w-full px-4 py-3 border ${cpfError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${cpfError ? 'focus:ring-red-500' : 'focus:ring-red-500'} text-gray-450 text-center`}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                required
              />
              {cpfError && <p className="mt-1 text-sm text-red-600">{cpfError}</p>}
            </div>

            <br></br>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-450 mb-1">Email institucional</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-450 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-450 text-center"
                placeholder="seu.email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <br></br>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-450 mb-1">Senha</label>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-450 text-center"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <br></br>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-450 mb-1">Confirme sua senha</label>
              <input
                type={mostrarConfirmSenha ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-450 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-450 text-center"
                placeholder="••••••••"
                value={csenha}
                onChange={(e) => setCsenha(e.target.value)}
                required
              />
           
            </div>

            <br></br>

            {/* Código Admin */}
            <div>
              <label className="block text-sm font-medium text-gray-450 mb-1">Código de Administrador</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-450 text-center"
                placeholder="Código fornecido para adms"
                value={codigoAdmin}
                onChange={(e) => setCodigoAdmin(e.target.value)}
                required
              />
            </div>
            <br></br><br></br>

            <button
              type="submit"
              className="w-full bg-red-1000 text-gray-400 py-3 rounded-lg hover:bg-red-900 transition duration-300 flex items-center justify-center space-x-2 font-medium"
            >
              <span>Criar conta</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <br></br>

            <div className="flex flex-col items-center space-y-3 text-sm">
              <button
                onClick={() => router.push('/')}
                className="text-red-600 hover:text-red-700 text-center transition duration-200 "
              >
                Voltar para a página de login
              </button>
              </div>

              <br></br><br></br>
          </form>
        </div>
      </div>
    </div>
  );
}