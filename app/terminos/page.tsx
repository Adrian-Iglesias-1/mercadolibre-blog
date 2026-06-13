import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Términos de Uso - ShopHub AR',
  description: 'Condiciones de uso del sitio ShopHub AR.',
};

export default function TerminosPage() {
  return (
    <LegalLayout eyebrow="Condiciones" title="Términos de Uso" updatedAt="Junio 2026">
      <p>
        Al usar <strong>ShopHub AR</strong> aceptás estos términos. Si no estás de acuerdo, por favor
        no utilices el sitio.
      </p>

      <h2>Qué es ShopHub AR</h2>
      <p>
        Somos un sitio de recomendaciones y guías de compra que enlaza a productos de Mercado Libre
        Argentina. <strong>No vendemos productos</strong> ni procesamos pagos: toda compra se realiza
        directamente en Mercado Libre, bajo sus propios términos y condiciones.
      </p>

      <h2>Precios e información</h2>
      <p>
        Hacemos lo posible para que la información sea correcta, pero los precios, el stock y las
        características los gestionan Mercado Libre y sus vendedores, y pueden cambiar sin aviso.
        <strong> No garantizamos</strong> la exactitud permanente de los datos mostrados.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        ShopHub AR no es responsable por la calidad, entrega, garantía o cualquier aspecto de los
        productos comprados en Mercado Libre. Cualquier reclamo sobre una compra debe gestionarse con
        el vendedor o con Mercado Libre.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        El contenido editorial (guías, reviews, comparativas) es propiedad de ShopHub AR. Las marcas,
        imágenes de productos y nombres comerciales pertenecen a sus respectivos dueños.
      </p>

      <h2>Cambios</h2>
      <p>
        Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la
        publicada en esta página.
      </p>
    </LegalLayout>
  );
}
