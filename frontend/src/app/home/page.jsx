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
 
   
      <div className="absolute inset-0 bg-black/40" />
 
      {/* Botões */}

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-gray-400">
        <h1 className="text-3xl font-bold mb-20">Logue com seu e-mail institucional, se não tiver um entre em contato
        </h1>
 
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
 