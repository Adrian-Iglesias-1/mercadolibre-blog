import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'ShopHub AR - Recomendaciones de Mercado Libre',
  description: 'Descubre lo mejor de Argentina con nuestras recomendaciones verificadas de Mercado Libre.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-dmsans bg-black-sh text-text-sh selection:bg-accent-sh selection:text-black-sh">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
