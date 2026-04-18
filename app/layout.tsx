import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chapita.eu";
  return url.startsWith("http") ? url : `https://${url}`;
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
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
    images: [{ url: "/hero-grill.webp", width: 1200, height: 630, alt: "Chapita — Frango Assado na Brasa" }],
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
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chapita.eu";
  if (!siteUrl.startsWith("http")) siteUrl = `https://${siteUrl}`;
  const phone   = process.env.NEXT_PUBLIC_PHONE ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Churrasqueira do Chapita",
    servesCuisine: ["Portuguese", "Grilled chicken"],
    url: siteUrl,
    telephone: phone,
    priceRange: "€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "R. dos Lavradores 23",
      addressLocality: "Valado dos Frades",
      postalCode: "2450-335",
      addressCountry: "PT",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "12:00", closes: "15:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "19:00", closes: "22:00" },
    ],
    image: `${siteUrl}/hero-grill.webp`,
  };

  return (
    <html lang="pt" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
