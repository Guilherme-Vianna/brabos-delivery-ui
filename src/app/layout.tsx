import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { APP_NAME } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: "Delivery próprio para hamburguerias: cardápio online, pedidos em tempo real e sem comissão.",
  appleWebApp: { capable: true, title: "Brabos", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bebas.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
