import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LocationRedirectProvider from "../components/LocationRedirectProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal Imobiliário",
  description: "Encontre o imóvel dos seus sonhos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <LocationRedirectProvider>
          {children}
        </LocationRedirectProvider>
      </body>
    </html>
  );
}
