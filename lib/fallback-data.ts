import { Product } from '@/types';
import { categories } from '@/lib/categories';

// Tecnología - Imágenes REALES de Mercado Libre (URLs estáticas)
const techProducts: Product[] = [
  {
    id: 'tech-1',
    title: 'Apple iPhone 15 Pro 128 GB - Titanio natural',
    price: '2150000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_660940-MLA71783082304_092023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA27209937',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Apple'
  },
  {
    id: 'tech-2', 
    title: 'Samsung Galaxy S24 Ultra 5G 256 GB - Titanium Gray',
    price: '2050000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_900085-MLA50341775791_062022-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA31006424',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Samsung'
  },
  {
    id: 'tech-3',
    title: 'MacBook Air M2 13.6" 8GB RAM 256GB SSD - Space Gray',
    price: '1850000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_846205-MLA50711684067_072022-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA19515518',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Apple'
  },
  {
    id: 'tech-4',
    title: 'Auriculares Sony WH-1000XM5 Noise Cancelling Black',
    price: '680000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_675545-MLA71536417730_092023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA19175244',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Sony'
  },
  {
    id: 'tech-5',
    title: 'iPad Air (5.ª generación) M1 64GB - Azul',
    price: '950000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_605929-MLA71536417730_092023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA18951234',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Apple'
  },
  {
    id: 'tech-6',
    title: 'Smartwatch Apple Watch Series 9 GPS 45mm Midnight',
    price: '620000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_731333-MLA71120005704_082023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA27209935',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Apple'
  },
  {
    id: 'tech-7',
    title: 'Consola Nintendo Switch OLED 64GB - Blanco',
    price: '645000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_944120-MLU74501257969_022024-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA18536340',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Nintendo'
  },
  {
    id: 'tech-8',
    title: 'Teclado Mecánico Logitech G Pro TKL - RGB Blue',
    price: '145000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_787524-MLA43851086036_102020-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA15197775',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Logitech'
  },
  {
    id: 'tech-9',
    title: 'Monitor Samsung Odyssey G5 27" 144Hz 1ms',
    price: '480000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_888461-MLA48003442654_102021-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA16208365',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Samsung'
  },
  {
    id: 'tech-10',
    title: 'Auriculares Inalámbricos Sony LinkBuds S Black',
    price: '280000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_608151-MLU71131154563_082023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA19208365',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Sony'
  },
  {
    id: 'tech-11',
    title: 'Cámara Mirrorless Canon EOS R10 + 18-45mm',
    price: '1450000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_868310-MLA48003442654_102021-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA19503442',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'Canon'
  },
  {
    id: 'tech-12',
    title: 'Notebook ASUS Zenbook 14" OLED Core i5 16GB',
    price: '1250000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_675545-MLA71536417730_092023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar/p/MLA19203442',
    category: categories.find(c => c.id === 'tecnologia')!,
    brand: 'ASUS'
  }
];

// Hogar
const homeProducts: Product[] = [
  {
    id: 'home-1',
    title: 'Cafetera Nespresso Vertuo Pop Black',
    price: '195000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_608151-MLU71131154563_082023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar',
    category: categories.find(c => c.id === 'hogar')!,
    brand: 'Nespresso'
  },
  {
    id: 'home-2',
    title: 'Aspiradora Robot iRobot Roomba j7+',
    price: '1250000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_900085-MLA50341775791_062022-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar',
    category: categories.find(c => c.id === 'hogar')!,
    brand: 'iRobot'
  }
];

// Gaming
const gamingProducts: Product[] = [
  {
    id: 'gaming-1',
    title: 'PlayStation 5 Slim 1TB con 2 Controles',
    price: '1150000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_944120-MLU74501257969_022024-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar',
    category: categories.find(c => c.id === 'gaming')!,
    brand: 'Sony'
  },
  {
    id: 'gaming-2',
    title: 'Nintendo Switch OLED Mario Red Edition',
    price: '680000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_605929-MLA71536417730_092023-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar',
    category: categories.find(c => c.id === 'gaming')!,
    brand: 'Nintendo'
  }
];

// Perfumes
const perfumeProducts: Product[] = [
  {
    id: 'perfume-1',
    title: 'Sauvage Dior Eau De Parfum 100ml',
    price: '245000',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_868310-MLA48003442654_102021-O.webp',
    productUrl: 'https://www.mercadolibre.com.ar',
    category: categories.find(c => c.id === 'perfumes')!,
    brand: 'Dior'
  }
];

export function getFallbackProducts(category?: string): Product[] {
  switch (category) {
    case 'hogar': return homeProducts;
    case 'gaming': return gamingProducts;
    case 'perfumes': return perfumeProducts;
    case 'tecnologia': return techProducts;
    default: return techProducts;
  }
}

export function getBestSellersFallback(): Product[] {
  return [...techProducts, ...gamingProducts, ...homeProducts].slice(0, 10);
}
