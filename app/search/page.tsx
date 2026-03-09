import { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Buscar Productos - ShopHub',
  description: 'Busca los mejores productos en tecnología, perfumes y más',
};

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return <ClientPage searchParams={searchParams} />;
}
