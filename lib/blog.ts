export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  // Add blog posts here
  // {
  //   slug: 'getting-started',
  //   title: 'Getting Started with ...',
  //   description: 'A beginner guide to ...',
  //   publishedAt: '2026-03-01',
  //   category: 'Guide',
  //   readingTime: 5,
  //   content: '<h2>Introduction</h2><p>...</p>',
  // },
];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug);
}

export function getAllCategories(): string[] {
  return [...new Set(posts.map(p => p.category))];
}
