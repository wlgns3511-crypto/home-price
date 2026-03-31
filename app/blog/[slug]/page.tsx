import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { AuthorBox } from '@/components/AuthorBox';
import { Breadcrumb } from '@/components/Breadcrumb';

const c = siteConfig;
interface Props { params: Promise<{ slug: string }> }

export const revalidate = false;

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.description, alternates: { canonical: `/blog/${slug}` } };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog/' }, { label: post.title }]} />
      <h1>{post.title}</h1>
      <p className="text-sm text-slate-500">{post.publishedAt} · {post.readingTime} min read · {post.category}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <AuthorBox />
    </article>
  );
}
