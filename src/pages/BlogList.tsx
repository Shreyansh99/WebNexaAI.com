import React, { useEffect, useState } from 'react';
import { setPageMeta, injectJsonLd, getAllBlogs, type Blog } from '@/src/lib/supabase';

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageMeta({
      title: 'Blog | Webnexa AI',
      description: 'Insights on AI automation, growth systems, and case studies.',
      url: window.location.origin + '/blog'
    });
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'Webnexa AI Blog',
      'url': window.location.origin + '/blog'
    });
    (async () => {
      try {
        const data = await getAllBlogs();
        setBlogs(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-10">Latest Posts</h1>
        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {blogs.map((b) => (
              <a key={b.slug} href={`/blog/${b.slug}`} className="group block bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-950 dark:hover:border-white transition-colors">
                {b.coverImageUrl && (
                  <img src={b.coverImageUrl} alt={b.title} className="w-full h-48 object-cover" loading="lazy" />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600">{b.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-3">{b.excerpt || ''}</p>
                  <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {b.tags?.join(' • ')}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogList;
