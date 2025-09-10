"use client";

// Importações

import React from "react";
import { useRouter } from 'next/navigation';
 


export default function Home() {
    const router = useRouter();
    
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Vídeo de fundo */}

      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/video/intro.mp4" type="video/mp4" />
        Seu navegador não suporta vídeos em HTML5.
      </video>
 
   

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
  <h1 className="text-2xl md:text-3xl font-bold text-gray-200 leading-snug max-w-2xl">
    Logue com seu e-mail institucional. Se não tiver um, entre em contato com o administrador.
    
  </h1>

 
      {/* Botões */}
 
        <br />
 
        <div className="flex gap-8 ">
          <button
            className="inline-flex items-center justify-center
                       text-base font-semibold text-white
                       bg-red-800 rounded-2xl
                       !px-8 !py-4    
                       shadow-lg
                       transition-all duration-300 ease-out
                       hover:bg-red-600 hover:scale-105 hover:shadow-xl
                       active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/40"onClick={() => router.push("/")}
          >
            Entre
          </button>
 
          <button className="inline-flex items-center justify-center
                       text-base font-semibold text-white
                       bg-red-800 rounded-2xl
                       !px-8 !py-5
                       shadow-lg
                       transition-all duration-300 ease-out
                       hover:bg-red-600 hover:scale-105 hover:shadow-xl
                       active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/40" onClick={() => window.open("https://www.sp.senai.br/", "_blank")}
          >
            Entre em contato
          </button>
        </div>
      </div>
    </div>
  );
}
 