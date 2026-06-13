import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const siteUrl = 'https://shophub.com.ar';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ShopHub AR - Recomendaciones de Mercado Libre',
    template: '%s | ShopHub AR',
  },
  description: 'Descubre lo mejor de Argentina con nuestras recomendaciones verificadas de Mercado Libre.',
  keywords: ['Mercado Libre', 'ofertas Argentina', 'recomendaciones de productos', 'más vendidos', 'comparativas de precios'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: 'ShopHub AR',
    title: 'ShopHub AR - Recomendaciones de Mercado Libre',
    description: 'Descubre lo mejor de Argentina con nuestras recomendaciones verificadas de Mercado Libre.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopHub AR - Recomendaciones de Mercado Libre',
    description: 'Descubre lo mejor de Argentina con nuestras recomendaciones verificadas de Mercado Libre.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'ShopHub AR',
        url: siteUrl,
        logo: `${siteUrl}/opengraph-image`,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'ShopHub AR',
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'es-AR',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="es">
      <body className="font-dmsans bg-black-sh text-text-sh selection:bg-accent-sh selection:text-black-sh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
