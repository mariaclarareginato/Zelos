// Importações

import Link from "next/link";
import React from "react";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6"; 

const Footer = () => {
  return (
    <footer className="bg-red-950 text-gray-300 rounded-40">
      <div className="w-full flex justify-center">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
          <br />

          <div className="flex flex-wrap justify-between">
            <div className="min-w-[220px] flex-1">
              <h3 className="text-4xl font-semibold text-gray-400">SENAI</h3>
              <br />
              <div className="mt-4 flex gap-4 text-gray-400">
                <a
                  href="https://www.instagram.com/senaimecatronica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  <FaInstagram size={42} />
                </a>

                <a
                  href="https://www.linkedin.com/school/senaisp/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  <FaLinkedin size={42} />
                </a>

                <a
                  href="https://x.com/senaisaopaulo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  <FaXTwitter size={42} /> 
                </a>
              </div>
            </div>

            {/* Coluna */}

            <div className="min-w-[150px]">
              <h4 className="font-semibold mb-3 text-gray-400">Sobre</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/nossahistoria" className="hover:text-gray-400">
                    Nossa História
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="hover:text-gray-400">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/termosdeuso" className="hover:text-gray-400">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Linha inferior */}
          <br />
          <div className="mt-10 pt-4 text-center text-xs text-gray-400">
            <p>
              © 2025 SENAI. Todos os direitos reservados. |{" "}
              <a href="#" className="mx-2 hover:text-gray-400">
                Termos
              </a>{" "}
              |{" "}
              <a href="#" className="mx-2 hover:text-gray-400">
                Privacidade
              </a>{" "}
              |{" "}
              <a href="#" className="mx-2 hover:text-gray-400">
                Cookies
              </a>
            </p>
          </div>
        </div>
      </div>
      <br />
    </footer>
  );
};

export default Footer;
