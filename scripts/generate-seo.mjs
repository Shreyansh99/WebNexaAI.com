import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const origin = process.env.SITE_ORIGIN || 'https://webnexaai.com';
const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function fetchBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('slug, updatedAt, publishedAt, title, excerpt')
    .order('publishedAt', { ascending: false });
  if (error) {
    return [];
  }
  return data || [];
}

function buildSitemap(blogs) {
  const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
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
}

function buildRss(blogs) {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
      <guid>${origin}/blog/${b.slug}</guid>
    </item>`).join('')}
  </channel>
</rss>`;
}

async function main() {
  const blogs = await fetchBlogs();
  const sitemap = buildSitemap(blogs);
  const rss = buildRss(blogs);
  const outDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf-8');
  fs.writeFileSync(path.join(outDir, 'rss.xml'), rss, 'utf-8');
  console.log('Generated sitemap.xml and rss.xml');
}

main().catch((e) => { console.error('Failed to generate SEO files', e); process.exit(1); });
