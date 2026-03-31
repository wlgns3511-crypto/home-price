import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/site.config';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'your-indexnow-key';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'urls array required' }, { status: 400 });
    }

    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: siteConfig.domain,
        key: INDEXNOW_KEY,
        keyLocation: `https://${siteConfig.domain}/${INDEXNOW_KEY}.txt`,
        urlList: urls.map(u => `https://${siteConfig.domain}${u}`),
      }),
    });

    return NextResponse.json({ status: response.status, submitted: urls.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
