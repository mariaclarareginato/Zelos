'use client';

// Importações

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Inputmask from 'inputmask';


// Funcionalidade (Confirmação de senha, Validação de email institucional)

export default function Cadastro() {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [csenha, setCsenha] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Aplica a máscara ao campo de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
      Inputmask({
        mask: '999.999.999-99',
        showMaskOnHover: false,
      }).mask(cpfInput);
    }
  }, []);

  // Função para validar CPF
  const validarCPF = (cpf) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let dv1 = resto > 9 ? 0 : resto;
    if (dv1 !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let dv2 = resto > 9 ? 0 : resto;
    if (dv2 !== parseInt(cpf.charAt(10))) {
      return false;
    }

    return true;
  };

  const handleCPFChange = (e) => {
    const value = e.target.value;
    setCpf(value);
    
    // Limpa o erro se o campo estiver vazio
    if (!value.trim()) {
      setCpfError('');
      return;
    }

    // Valida o CPF apenas se estiver completo
    if (value.replace(/[^\d]/g, '').length === 11) {
      if (!validarCPF(value)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    }
  };

  const cadastrar = async (e) => {
    e.preventDefault();

    // Validações
    if (cpfError) {
      alert('Por favor, corrija o CPF antes de continuar.');
      return;
    }

    if (!validarCPF(cpf)) {
      alert('CPF inválido. Por favor, verifique.');
      return;
    }

    if (senha !== csenha) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3004/cadastro', {
        cpf: cpf.replace(/[^\d]/g, ''), // Envia apenas os números
        email,
        senha,
      });
      alert(res.data.mensagem);
      router.push('/login');
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro no cadastro');
    }
  };


  // Formulário

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 bg-no-repeat z-0"
        style={{backgroundImage: "url('/geral.imgs/fundo.png')"}}
      ></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-gray/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-red-700 mb-3">
            Bem-vindo ao Zelos!
            </h1>
          
            <p className="text-lg text-center text-gray-600">
            Crie sua conta  <br />
              <span className="font-semibold text-red-800">SENAI Armando de Arruda Pereira </span>
            </p>
          </div>

          <form className="space-y-6" onSubmit={cadastrar}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <div className="relative">
                <input
                  id="cpf"
                  type="text"
                  className={`w-full px-4 py-3 border ${cpfError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${cpfError ? 'focus:ring-red-500' : 'focus:ring-red-100'} focus:border-transparent text-gray-700`}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCPFChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {cpfError ? (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  )}
                </div>
              </div>
              {cpfError && (
                <p className="mt-1 text-sm text-red-600">{cpfError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email institucional
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  placeholder="seu.email@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarSenha ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>


           <br></br>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirme sua senha
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmSenha ? "text" : "password"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  placeholder="••••••••"
                  value={csenha}
                  onChange={(e) => setCsenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmSenha(!mostrarConfirmSenha)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarConfirmSenha ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>


            <br></br>
            <button
              type="submit"
              className="w-full bg-red-900 text-white py-3 rounded-lg hover:bg-red-500 transition duration-300 flex items-center justify-center space-x-2 font-medium"
            >
              <span>Criar conta</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          <br></br>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="h-px flex-1 bg-gray-300"></span>
              <span className="text-sm text-gray-500 font-medium">ou</span>
              <span className="h-px flex-1 bg-gray-300"></span>
            </div>
            <div className="text-center">
              <br></br>
              <button
                onClick={() => router.push('/login')}
                className="text-red-800 hover:text-red-600 font-medium transition duration-200"
              >
                Já tem uma conta? Entre aqui
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
