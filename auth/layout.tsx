"use client"

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-aewf.png"
                alt="Logo AEWF"
                width={48}
                height={48}
                className="rounded-full"
              />
              <span className="font-bold text-lg text-primary hidden md:inline">
                Agence de l&apos;Emploi WF
              </span>
            </Link>
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="container max-w-lg mx-auto py-16 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full border-t bg-white py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Agence de l&apos;Emploi de Wallis et Futuna. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}