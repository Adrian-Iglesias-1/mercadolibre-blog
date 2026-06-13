import Link from 'next/link';

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

export default function LegalLayout({ eyebrow, title, updatedAt, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-black-sh pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <Link
          href="/"
          className="inline-flex items-center text-accent-sh hover:text-[#d4eb3a] font-bold mb-8 group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          Volver al inicio
        </Link>

        <p className="text-accent-sh text-[11px] font-semibold tracking-[3px] uppercase mb-4">
          {eyebrow}
        </p>
        <h1 className="font-syne text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none mb-4">
          {title}
        </h1>
        <p className="text-text-muted-sh text-sm mb-12">Última actualización: {updatedAt}</p>

        <div className="legal-prose flex flex-col gap-6 text-text-muted-sh leading-relaxed font-light">
          {children}
        </div>
      </div>
    </div>
  );
}
