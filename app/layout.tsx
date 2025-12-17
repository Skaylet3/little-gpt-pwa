import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Little GPT",
  description: "A lightweight ChatGPT-like assistant with offline support",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "Little GPT",
  },
  icons: {
    apple: "/icons/GPTIcon192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased `}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
