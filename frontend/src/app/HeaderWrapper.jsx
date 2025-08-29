"use client";

// Importações 

import { usePathname } from "next/navigation";
import Header from "./components/Header/Header.jsx"; 
import { useState, useEffect } from "react";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 


  // Escondendo Header de todas as páginas menos essas

  const showLayout = (
    pathname.startsWith("/home.admin") ||
    pathname.startsWith("/home.tecnico") ||
    pathname.startsWith("/home.usuario") ||
    pathname.startsWith("/nossahistoria") ||
    pathname.startsWith("/contato") ||
    pathname.startsWith("/termosdeuso") 
  );



  return showLayout ? <Header /> : null;


}
