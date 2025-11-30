import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn('Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url || '', key || '');

export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  authorName?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  updatedAt?: string;
};

export async function getAllBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('publishedAt', { ascending: false });
  if (error) throw error;
  return data as Blog[];
}

export async function getBlogBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Blog | null;
}

export async function createBlog(payload: Omit<Blog, 'id'>) {
  const withDates = { ...payload, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const { data, error } = await supabase
    .from('blogs')
    .insert(withDates)
    .select('*')
    .single();
  if (error) throw error;
  return data as Blog;
}

export function setPageMeta({ title, description, url, image }: { title: string; description?: string; url?: string; image?: string }) {
  if (title) document.title = title;
  const ensure = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };
  if (description) ensure('description', description);
  const og = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };
  if (title) og('og:title', title);
  if (description) og('og:description', description);
  const origin = (window.location && window.location.origin) || 'https://webnexaai.com';
  const absoluteUrl = url ? (url.startsWith('http') ? url : origin + url) : window.location.href;
  og('og:url', absoluteUrl);
  if (image) {
    const absoluteImage = image.startsWith('http') ? image : origin + image;
    og('og:image', absoluteImage);
  }
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', absoluteUrl);
}

export function injectJsonLd(json: Record<string, any>) {
  const existing = document.getElementById('jsonld');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'jsonld';
  script.text = JSON.stringify(json);
  document.head.appendChild(script);
}
