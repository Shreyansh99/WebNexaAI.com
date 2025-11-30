import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const origin = process.env.SITE_ORIGIN || 'https://webnexaai.com';
  const url = process.env.VITE_SUPABASE_URL as string;
  const key = process.env.VITE_SUPABASE_ANON_KEY as string;

  const supabase = createClient(url || '', key || '');

  let blogs: any[] = [];
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('publishedAt', { ascending: false });
    if (error) throw error;
    blogs = data || [];
  } catch {
    blogs = [];
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Webnexa AI Blog</title>
    <link>${origin}/blog</link>
    <description>AI Automation insights</description>
    ${blogs.map(b => `
    <item>
      <title>${b.title}</title>
      <link>${origin}/blog/${b.slug}</link>
      <description>${b.excerpt || ''}</description>
      <pubDate>${b.publishedAt ? new Date(b.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(rss);
}
