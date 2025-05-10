import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import AppHeader from '@/components/layout/AppHeader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RideShare DriverAds',
  description: 'Connects passengers with drivers, monetized by ads for drivers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-secondary`}>
        <AuthProvider>
          <AppHeader />
          <main className="min-h-[calc(100vh-4rem)]"> {/* Adjust 4rem based on AppHeader height */}
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
