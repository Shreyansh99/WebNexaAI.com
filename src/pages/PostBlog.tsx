import React, { useEffect, useMemo, useState } from 'react';
import { setPageMeta, injectJsonLd, createBlog, supabase } from '@/src/lib/supabase';

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
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverUrlError, setCoverUrlError] = useState('');

  function isValidUrl(u: string) {
    try {
      const url = new URL(u);
      return /^https?:$/.test(url.protocol);
    } catch {
      return false;
    }
  }

  const previewUrl = useMemo(() => {
    if (coverImageFile) {
      return URL.createObjectURL(coverImageFile);
    }
    if (coverImageUrl && isValidUrl(coverImageUrl)) return coverImageUrl;
    return '';
  }, [coverImageFile, coverImageUrl]);

  useEffect(() => {
    if (coverImageUrl) {
      setCoverUrlError(isValidUrl(coverImageUrl) ? '' : 'Invalid image URL');
    } else {
      setCoverUrlError('');
    }
  }, [coverImageUrl]);

  useEffect(() => {
    return () => {
      if (coverImageFile && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [coverImageFile, previewUrl]);
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
      const finalSlug = slug || autoSlug;
      let finalCoverUrl = coverImageUrl;
      if (coverImageFile) {
        const bucket = 'blog-images';
        const path = `${finalSlug}/${Date.now()}-${coverImageFile.name}`;
        const upload = await supabase.storage.from(bucket).upload(path, coverImageFile, {
          contentType: coverImageFile.type,
          upsert: true,
          cacheControl: '3600'
        });
        if (upload.error) throw upload.error;
        const pub = supabase.storage.from(bucket).getPublicUrl(path);
        finalCoverUrl = pub.data.publicUrl;
      }
      const payload = {
        title,
        slug: finalSlug,
        excerpt,
        content,
        coverImageUrl: finalCoverUrl,
        coverImageAlt: coverImageAlt || title,
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
            {coverUrlError && !coverImageFile && (
              <div className="text-red-600 text-xs mt-1">{coverUrlError}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Author Name</label>
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
          </div>
        </div>
        {previewUrl && (
          <div className="mt-4">
            <img src={previewUrl} alt={coverImageAlt || title} className="w-full max-h-64 object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Upload Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)} className="w-full" />
            <p className="text-xs text-slate-500 mt-1">If provided, this will override the URL above.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Cover Image Alt Text</label>
            <input value={coverImageAlt} onChange={(e) => setCoverImageAlt(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-black border-slate-300 dark:border-slate-700" />
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
          <button type="submit" disabled={submitting || (!!coverImageUrl && !isValidUrl(coverImageUrl) && !coverImageFile)} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Posting…' : 'Post Blog'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PostBlog;
