import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { breadcrumbSchema, articleSchema } from '@/lib/schema';
import { AuthorBox } from '@/components/AuthorBox';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

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
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title: post.title, description: post.description, url: `/blog/${slug}`, type: 'article', publishedTime: post.publishedAt },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog/' }, { name: post.title, url: `/blog/${slug}` }];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema({ title: post.title, description: post.description, slug, publishedAt: post.publishedAt, category: post.category })) }} />
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      <h1>{post.title}</h1>
      <p className="text-sm text-slate-500">{post.publishedAt} · {post.readingTime} min read · {post.category}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <AuthorBox />
      <CrossSiteLinks current={c.name} />
    </article>
  );
}
