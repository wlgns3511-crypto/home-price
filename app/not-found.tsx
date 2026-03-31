import Link from 'next/link';
import { siteConfig } from '@/site.config';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">Page Not Found</h1>
      <p className="text-slate-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className={`text-${siteConfig.colors.primary}-600 hover:text-${siteConfig.colors.primary}-800 font-medium underline`}>
        &larr; Back to {siteConfig.name}
      </Link>
    </div>
  );
}
