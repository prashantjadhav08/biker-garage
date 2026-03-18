import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biker Garage - Management System',
  description: 'Professional bike service management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
