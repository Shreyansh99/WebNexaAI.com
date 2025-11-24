import React, { useEffect, useMemo, useState } from 'react';
import { setPageMeta, injectJsonLd, createBlog } from '@/src/lib/supabase';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const PostBlog = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const autoSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    setPageMeta({ title: 'Post a Blog | Webnexa AI', url: window.location.origin + '/postblog' });
    injectJsonLd({ '@context': 'https://schema.org', '@type': 'WebPage', 'name': 'Post a Blog' });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        slug: slug || autoSlug,
        excerpt,
        content,
        coverImageUrl,
        authorName,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
      };
      const created = await createBlog(payload);
      window.location.href = `/blog/${created.slug}`;
    } catch (err) {
      alert('Failed to post blog');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-screen-md mx-auto px-6 md:px-12 lg:px-16">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Create New Blog Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Slug</label>
            <input value={slug} placeholder={autoSlug} onChange={(e) => setSlug(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700 h-24" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Content (HTML)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700 h-56" required />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Cover Image URL</label>
              <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Author Name</label>
              <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Meta Title</label>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Meta Description</label>
              <input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Posting…' : 'Post Blog'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PostBlog;
