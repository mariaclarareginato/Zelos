// Importações

import React from "react";

 
const TermosDeUso = () => {
    return (
        <section className="py-12 flex justify-center">
        <div className="w-full max-w-5xl px-6 ">
 
          <br />

        {/* Título */}

          <h3 className="text-3xl font-bold text-red-800 mb-6">
          Termos de Uso
          </h3>
 
  <br />

        {/* Lista/texto */}
     
      <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
           1. Uso do Site
      </h2>
 
          <br />
 
          <p className="mb-4 text-gray-400">
         <li> O conteúdo do site é fornecido apenas para fins informativos e educacionais.</li>
          <li>Você concorda em utilizar o site de forma ética e legal, respeitando todas as leis aplicáveis.</li>
          </p>
 
  <br />
 
          <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
          2. Propriedade Intelectual
          </h2>
 
          <br />
          <p className="mb-4 text-gray-400">
         <li> Todo o conteúdo, incluindo textos, imagens, gráficos, logotipos, vídeos e software, é protegido por direitos autorais e outras leis de propriedade intelectual.</li>
         <li> É proibida a reprodução, distribuição ou modificação do conteúdo sem autorização prévia por escrito.</li>
          </p>
          <br />
 
 
          <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
            3. Cadastro e Conta de Usuário
          </h2>
          <br />
 
          <ul className="list-disc list-inside mb-4 text-gray-400">
          <li>Alguns serviços podem exigir cadastro. Você é responsável por manter a confidencialidade da sua conta e senha.</li>
          <li>Você concorda em notificar imediatamente o site sobre qualquer uso não autorizado da sua conta.</li>
          </ul>
  <br />
 
 
          <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
          4. Privacidade
          </h2>
          <br />
 
          <ul className="list-disc list-inside mb-4 text-gray-400">
            <li>As informações fornecidas pelos usuários serão tratadas conforme nossa Política de Privacidade.</li>
            <li>Recomendamos a leitura atenta da política de privacidade antes de fornecer qualquer dado pessoal.</li>
          </ul>
  <br />
         
 <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
 5. Limitação de Responsabilidade
          </h2>
          <br />
          <ul className="list-disc list-inside mb-4 text-gray-400">
            <li>O site não se responsabiliza por danos diretos ou indiretos decorrentes do uso ou da incapacidade de uso do site.</li>
            <li>Não garantimos que o site estará livre de erros ou interrupções.</li>
          </ul>
  <br />
 
 
  <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
  6. Links para Sites de Terceiros
          </h2>
          <br />
          <ul className="list-disc list-inside mb-4 text-gray-400">
            <li>Nosso site pode conter links para sites de terceiros. Não nos responsabilizamos pelo conteúdo ou práticas desses sites.</li>
          </ul>
          <br />
 
 
          <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
          7. Alterações nos Termos
          </h2>
          <br />
          <ul className="list-disc list-inside mb-4 text-gray-400">
            <li>Podemos atualizar estes termos a qualquer momento, sem aviso prévio.</li>
            <li>Recomendamos que você revise os termos regularmente para se manter informado sobre alterações.</li>
          </ul>
<br />
 
 
<h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3 text-gray-400">
8. Lei Aplicável
          </h2>
          <br />
          <ul className="list-disc list-inside mb-4 text-gray-400">
            <li>Estes termos são regidos pelas leis do Brasil.</li>
            <li>Qualquer disputa relacionada ao site será submetida à jurisdição exclusiva dos tribunais competentes.</li>
          </ul>
 
 
 
  <br /><br />
        </div>
      </section>
    );
};
export default TermosDeUso;