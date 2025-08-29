"use client";

// Importações

import { usePathname } from "next/navigation";
import Footer from './components/Footer/Footer.jsx';
import { useState, useEffect } from "react";

export default function FooterWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 


  // Escondendo Footer de todas as páginas menos essas

  const showLayout = (
    pathname.startsWith("/home.admin") ||
    pathname.startsWith("/home.tecnico") ||
    pathname.startsWith("/home.usuario") ||
    pathname.startsWith("/nossahistoria") ||
    pathname.startsWith("/contato") ||
    pathname.startsWith("/termosdeuso") 
  );

 

  return showLayout ? <Footer/> : null; 
 


}