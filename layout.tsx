import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Open_Sans } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-opensans',
});

export const metadata: Metadata = {
  title: 'Agence de l\'Emploi de Wallis et Futuna',
  description: 'Plateforme officielle de l\'Agence de l\'Emploi de Wallis et Futuna',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${openSans.variable} font-opensans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}