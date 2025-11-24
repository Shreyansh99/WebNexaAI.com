import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { setPageMeta, injectJsonLd, getBlogBySlug, getAllBlogs, type Blog } from '@/src/lib/supabase';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      try {
        const data = await getBlogBySlug(slug);
        setBlog(data);
        if (data) {
          const t = (s: string, n: number) => {
            const x = s.trim();
            if (x.length <= n) return x;
            const cut = x.slice(0, n);
            const i = cut.lastIndexOf(' ');
            return (i > 0 ? cut.slice(0, i) : cut).trim();
          };
          const title = t(data.metaTitle || data.title, 60);
          const desc = t(data.metaDescription || data.excerpt || '', 160);
          setPageMeta({
            title: title,
            description: desc,
            url: window.location.origin + `/blog/${data.slug}`,
            image: data.coverImageUrl
          });
          injectJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            'headline': title,
            'description': desc,
            'image': data.coverImageUrl ? [data.coverImageUrl] : undefined,
            'datePublished': data.publishedAt,
            'dateModified': data.updatedAt,
            'author': data.authorName ? { '@type': 'Person', 'name': data.authorName } : undefined,
            'publisher': {
              '@type': 'Organization',
              'name': 'Webnexa AI'
            },
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': window.location.origin + `/blog/${data.slug}`
            },
            'url': window.location.origin + `/blog/${data.slug}`,
            'keywords': (data.tags || []).join(', ')
          });
          try {
            const all = await getAllBlogs();
            const filtered = (all || [])
              .filter(b => b.slug !== data.slug)
              .filter(b => {
                if (!data.tags || data.tags.length === 0) return true;
                const t = new Set((data.tags || []).map(x => x.toLowerCase()));
                return (b.tags || []).some(x => t.has(x.toLowerCase()));
              })
              .slice(0, 3);
            setRelated(filtered);
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 py-24">Loading...</div>;
  if (!blog) return <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 py-24">Not found</div>;

  return (
    <article className="py-24 bg-white dark:bg-black">
      <div className="max-w-screen-lg mx-auto px-6 md:px-12 lg:px-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{blog.title}</h1>
        {blog.coverImageUrl && (
          <img src={blog.coverImageUrl} alt={blog.title} className="w-full rounded-2xl mb-8" loading="lazy" />
        )}
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
        <div className="mt-12 flex flex-wrap gap-4">
          <a href="/#services" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Explore Services</a>
          <a href="/#contact" className="px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5">Contact Us</a>
        </div>
        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6">Related Resources</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((b) => (
                <a key={b.slug} href={`/blog/${b.slug}`} className="group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-blue-600 transition-colors">
                  {b.coverImageUrl && (
                    <img src={b.coverImageUrl} alt={b.title} className="w-full h-40 object-cover" loading="lazy" />
                  )}
                  <div className="p-4">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{b.tags?.join(' • ')}</div>
                    <h4 className="text-lg font-bold group-hover:text-blue-600">{b.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">{b.excerpt || ''}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogDetail;
