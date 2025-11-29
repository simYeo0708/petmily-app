import type { Metadata } from "next";
import { Geist, Geist_Mono, Italiana } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import PageTracker from "./components/PageTracker";

const italiana = Italiana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-italiana',
  display: 'swap',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Petmily",
  description: "Companion for every chapter of your pet’s life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${italiana.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <PageTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
