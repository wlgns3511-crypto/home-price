import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getAllPosts } from '@/lib/blog';

const c = siteConfig;
export const metadata: Metadata = { title: 'Blog', description: `Latest articles and guides from ${c.name}.`, alternates: { canonical: '/blog/' },
  openGraph: { url: "/blog/" },
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{c.name} Blog</h1>
      {posts.length === 0 ? (
        <p className="text-slate-500">No posts yet. Check back soon!</p>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <a key={post.slug} href={`/blog/${post.slug}/`} className="block border rounded-lg p-4 hover:bg-slate-50">
              <h2 className={`text-lg font-bold text-${c.colors.primary}-700`}>{post.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{post.publishedAt} · {post.readingTime} min read · {post.category}</p>
              <p className="text-sm text-slate-600 mt-2">{post.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
