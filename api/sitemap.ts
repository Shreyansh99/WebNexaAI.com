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

  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${blogs.map(b => {
    const last = b.updatedAt || b.publishedAt || new Date().toISOString();
    return `
  <url>
    <loc>${origin}/blog/${escape(b.slug)}</loc>
    <lastmod>${new Date(last).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;}).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(sitemap);
}
