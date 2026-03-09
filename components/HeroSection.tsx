import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubre los Mejores
            <span className="block text-mercado-yellow text-5xl md:text-7xl">
              Productos del Mercado
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Recomendaciones expertas, ofertas exclusivas y los mejores precios en tecnología, 
            perfumes y más. Todo con enlaces de afiliado directos a MercadoLibre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tecnologia"
              className="bg-mercado-yellow hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
            >
              💻 Ver Tecnología
            </Link>
            <Link
              href="/perfumes"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 border-2 border-white/50"
            >
              🌸 Explorar Perfumes
            </Link>
            <Link
              href="/blog"
              className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 border-2 border-white"
            >
              📝 Leer Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
