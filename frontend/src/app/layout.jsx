// Layout site

import "./globals.css";
import HeaderWrapper from "./HeaderWrapper";
import FooterWrapper from "./FooterWrapper";

export const metadata = {
  title: "SENAI Armando de Arruda Pereira",
  description: "Site de gerenciamento de patrimônios e chamados.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <HeaderWrapper />
        {children}
        <FooterWrapper />
      </body>
    </html>
  );
}

