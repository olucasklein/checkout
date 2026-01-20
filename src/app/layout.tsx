import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Checkout | Finalize sua compra",
  description: "Checkout moderno, seguro e otimizado para conversão. Complete sua compra de forma rápida e fácil.",
  keywords: ["checkout", "pagamento", "e-commerce", "compra online"],
  authors: [{ name: "Checkout Modern" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="var(--theme-primary, #4f46e5)" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
