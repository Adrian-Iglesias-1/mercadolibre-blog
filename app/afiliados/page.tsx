import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Política de Afiliados - ShopHub AR',
  description: 'Cómo funciona nuestro programa de afiliados con Mercado Libre y qué significa para vos.',
};

export default function AfiliadosPage() {
  return (
    <LegalLayout eyebrow="Transparencia" title="Política de Afiliados" updatedAt="Junio 2026">
      <p>
        En <strong>ShopHub AR</strong> participamos del programa de afiliados de Mercado Libre.
        Queremos que sepas exactamente cómo funciona, porque la confianza es lo más importante.
      </p>

      <h2>¿Qué significa que seamos un sitio de afiliados?</h2>
      <p>
        Cuando hacés clic en un producto y lo comprás en Mercado Libre, nosotros podemos recibir
        una <strong>pequeña comisión</strong>. Esa comisión la paga Mercado Libre, no vos:{' '}
        <strong>el precio que pagás es exactamente el mismo</strong> que si entraras directo a la plataforma.
      </p>

      <h2>¿Eso influye en lo que recomendamos?</h2>
      <p>
        Mostramos productos reales de Mercado Libre Argentina seleccionados por su relevancia,
        precio y reputación del vendedor. Las comisiones nos permiten mantener el sitio gratuito y
        actualizar los productos a diario, pero <strong>no determinan</strong> si un producto es bueno
        para vos. Si algo no nos parece recomendable, no lo listamos.
      </p>

      <h2>Precios y disponibilidad</h2>
      <p>
        Los precios y el stock se actualizan periódicamente, pero los gestiona Mercado Libre y sus
        vendedores. El precio válido siempre es el que figura en{' '}
        <a href="https://www.mercadolibre.com.ar" target="_blank" rel="noopener noreferrer">Mercado Libre</a> al
        momento de tu compra.
      </p>

      <h2>Independencia</h2>
      <p>
        ShopHub AR es un proyecto independiente y no está operado ni respaldado oficialmente por
        Mercado Libre S.R.L. Todas las marcas mencionadas pertenecen a sus respectivos dueños.
      </p>
    </LegalLayout>
  );
}
