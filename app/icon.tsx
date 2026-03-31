import { ImageResponse } from 'next/og';
import { siteConfig } from '@/site.config';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

const colorMap: Record<string, string> = {
  blue: '#2563eb', red: '#dc2626', green: '#16a34a', purple: '#9333ea',
  indigo: '#4f46e5', teal: '#0d9488', orange: '#ea580c', amber: '#d97706',
  emerald: '#059669', rose: '#e11d48', violet: '#7c3aed', cyan: '#0891b2',
  slate: '#475569',
};

export default function Icon() {
  const bg = colorMap[siteConfig.colors.primary] || '#2563eb';
  const letter = siteConfig.name.charAt(0);

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: bg, borderRadius: 6,
        color: 'white', fontSize: 20, fontWeight: 800,
        fontFamily: 'sans-serif',
      }}>
        {letter}
      </div>
    ),
    { ...size }
  );
}
