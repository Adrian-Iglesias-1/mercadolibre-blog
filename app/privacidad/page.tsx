import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Política de Privacidad - ShopHub AR',
  description: 'Qué datos recopilamos en ShopHub AR y cómo los usamos.',
};

export default function PrivacidadPage() {
  return (
    <LegalLayout eyebrow="Tus datos" title="Política de Privacidad" updatedAt="Junio 2026">
      <p>
        En <strong>ShopHub AR</strong> respetamos tu privacidad. Esta política explica qué información
        recopilamos y para qué la usamos, en lenguaje claro.
      </p>

      <h2>Qué datos recopilamos</h2>
      <ul>
        <li>
          <strong>Email de newsletter:</strong> solo si te suscribís voluntariamente para recibir
          ofertas y bajadas de precio. Podés darte de baja cuando quieras.
        </li>
        <li>
          <strong>Datos de navegación anónimos:</strong> métricas básicas de uso (páginas visitadas,
          dispositivo) para mejorar el sitio. No te identifican personalmente.
        </li>
      </ul>

      <h2>Para qué los usamos</h2>
      <p>
        Usamos tu email exclusivamente para enviarte el contenido al que te suscribiste:
        comparativas, guías de compra y alertas de precio. <strong>Nunca vendemos ni cedemos tu
        email</strong> a terceros.
      </p>

      <h2>Cookies y enlaces de afiliado</h2>
      <p>
        Al hacer clic en un producto, Mercado Libre puede usar cookies para atribuir la venta a
        nuestro programa de afiliados. Podés conocer más en nuestra{' '}
        <a href="/afiliados">Política de Afiliados</a>.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés pedir el acceso, la corrección o la eliminación de tus datos en cualquier momento
        escribiéndonos. Eliminamos tu email de nuestra lista apenas lo solicitás.
      </p>
    </LegalLayout>
  );
}
