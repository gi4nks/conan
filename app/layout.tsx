import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto',
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: "Conan - Private Investigator",
  description: "Your personal knowledge investigator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoMono.variable}`}>
      <body className="antialiased font-sans">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}