import type { Metadata } from "next";
import { Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Our Covenantal Heritage | Registration",
  description: "Church conference registration system for Reformed Bible Study PH"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${playfair.variable} antialiased`}>{children}</body>
    </html>
  );
}
