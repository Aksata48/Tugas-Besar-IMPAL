import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NongkiYuk - Cari Tempat Nongkrong Terbaik",
  description: "Platform rekomendasi tempat nongkrong di sekitar kampus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={clientId}>
          <Navbar />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}