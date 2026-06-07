import './globals.css';
import type { Metadata, Viewport } from 'next';

// FASE 5: SEO basico + viewport mobile
export const metadata: Metadata = {
  title: 'Super Empanada El Meneo | Pedidos a domicilio',
  description:
    'Las mejores empanadas calientes y crujientes, pedidas desde tu celular y entregadas a tu puerta.',
  openGraph: {
    title: 'Super Empanada El Meneo',
    description: 'Empanadas a domicilio en minutos.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg pb-20">{children}</body>
    </html>
  );
}
