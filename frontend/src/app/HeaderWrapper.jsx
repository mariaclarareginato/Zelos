"use client";



import { usePathname } from "next/navigation";
import Header from "./Header/Header";
import { useState, useEffect } from "react";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Evita HTML diferente no SSR


  // Escondendo Header de todas as páginas menos essas

  const showLayout = (
    pathname.startsWith("/home.admin") ||
    pathname.startsWith("/home.tecnico") ||
    pathname.startsWith("/home.usuario")
  );



  return showLayout ? <Header /> : null;


}
