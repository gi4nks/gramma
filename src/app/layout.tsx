import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShoppingBasket, BookOpen, Calendar, Refrigerator, Home, Sparkles } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gramma - Gestione Menu Settimanale",
  description: "Organizza i tuoi pasti in base a cosa hai in frigo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" data-theme="cupcake">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="drawer lg:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col min-h-screen bg-base-200">
            {/* Navbar for mobile */}
            <div className="navbar bg-base-100 lg:hidden shadow-sm">
              <div className="flex-none">
                <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost drawer-button">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </label>
              </div>
              <div className="flex-1">
                <Link href="/" className="btn btn-ghost text-xl font-black italic">Gramma</Link>
              </div>
            </div>
            
            <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
              {children}
            </main>
          </div> 
          
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label> 
            <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content flex flex-col gap-2">
              <li className="mb-4">
                <Link href="/" className="text-2xl font-bold flex gap-2 items-center">
                  <span className="text-primary">Gramma</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <Home size={20} /> Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pantry">
                  <Refrigerator size={20} /> Dispensa
                </Link>
              </li>
              <li>
                <Link href="/recipes">
                  <BookOpen size={20} /> Ricette
                </Link>
              </li>
              <li>
                <Link href="/weekly-plan">
                  <Calendar size={20} /> Piano Settimanale
                </Link>
              </li>
              <li>
                <Link href="/inspiration">
                  <Sparkles size={20} /> Ispirazione
                </Link>
              </li>
              <li>
                <Link href="/shopping-list">
                  <ShoppingBasket size={20} /> Lista Spesa
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  );
}
