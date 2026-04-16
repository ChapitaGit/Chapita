import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Churrasqueira do Chapita — Frango Assado na Brasa",
  description:
    "O melhor frango assado na brasa. Encomende já por telefone ou WhatsApp. Pratos do dia frescos e preparados na hora.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chapita",
  },
  openGraph: {
    title: "Churrasqueira do Chapita",
    description: "O melhor frango assado na brasa — desde sempre.",
    type: "website",
    locale: "pt_PT",
  },
};

export const viewport: Viewport = {
  themeColor: "#e84018",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover", // enables safe-area-inset on iPhone notch
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
