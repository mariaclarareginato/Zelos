// Importações

import React from "react";
import Image from "next/image";
 
const NossaHistoria = () => {
  return (
    <section className="py-12 flex justify-center">
      <div className="w-full max-w-5xl px-6 text-center">
 
        <br />

        {/* Título */}

        <h3 className="text-3xl font-bold text-red-800 mb-6">
          História da Escola SENAI Armando de Arruda Pereira
        </h3>
 
<br />

         {/* Texto */}

        <p className="mb-4 text-gray-400">
          A <strong>Escola SENAI Armando de Arruda Pereira</strong> foi concebida
          como a primeira unidade da instituição voltada à{" "}
          <strong>Indústria 4.0</strong>, inaugurada em agosto de 2017 em São
          Caetano do Sul. E o nome homenageia <strong>Armando de Arruda Pereira</strong> (1889–1955),
          engenheiro, prefeito de São Paulo e defensor do desenvolvimento urbano
          e industrial. Ele foi idealizador do Parque do Ibirapuera e participou
          da fundação do SENAI e SESI.
          <br />
          A unidade é referência em <strong>tecnologia e inovação</strong>, unindo
          educação, empresas e pesquisa, e mantendo o compromisso histórico do
          SENAI com o desenvolvimento da indústria brasileira.
        </p>
 
<br />
 
        <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
          Surgimento e Propósito
        </h2>
        <br />
        <p className="mb-4 text-gray-400">
          A ideia surgiu a partir do <strong>Demonstrador de Manufatura Avançada</strong>,
          apresentado pelo SENAI na Expomafe 2017. O projeto foi pensado para
          criar um <strong>open lab</strong>, permitindo que empresas testem
          tecnologias e alunos aprendam de forma prática e conectada à indústria.
          O investimento foi de <strong>R$ 63,2 milhões</strong>.
        </p>
<br />
        <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
          Estrutura e Recursos
        </h2>
        <br />
        <ul className="list-disc list-inside mb-4 text-gray-400">
          <li>Área de cerca de <strong>15 mil m²</strong> em um prédio moderno.</li>
          <li>36 laboratórios, 9 salas de aula, 2 oficinas práticas.</li>
          <li>Biblioteca técnica, quadra poliesportiva e auditório para 150 pessoas.</li>
          <li>Destaque para o <strong>UpLab</strong>, voltado ao desenvolvimento de startups.</li>
        </ul>
<br />
        <h2 className="text-2xl font-semibold text-red-700 mt-6 mb-3">
          Cursos Oferecidos
        </h2>
        <br />
        <ul className="list-disc list-inside mb-4 text-gray-400">
          <li>Cursos técnicos em Mecatrônica, Desenvolvimento de Sistemas e Mecatrônica Industrial.</li>
          <li>Graduação tecnológica na área de Mecatrônica Industrial.</li>
          <li>Pós-graduação em Automação Industrial, Indústria 4.0 e mais.</li>
        </ul>
<br />
       
         {/* Imagem */}

<div className="mt-8 flex justify-center">
  <Image src='/imgs/senai.png' alt="Escola SENAI Armando de Arruda Pereira" width={800} height={450} className="rounded-lg drop-shadow-[0_10px_25px_rgba(220,38,38,0.5)]" />
</div>
 
 
<br /><br />
      </div>
    </section>
  );
};
 
export default NossaHistoria;