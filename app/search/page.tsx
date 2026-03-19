import { Metadata } from 'next';
import ClientPage from './ClientPage';
import { searchBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Buscar Productos - ShopHub',
  description: 'Busca los mejores productos en tecnología, perfumes y más',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = (searchParams?.q as string) || '';
  const blogResults = query ? await searchBlogPosts(query) : [];

  return <ClientPage searchParams={searchParams} blogResults={blogResults} />;
}
