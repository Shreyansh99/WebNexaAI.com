import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { setPageMeta, injectJsonLd, getBlogBySlug, getAllBlogs, type Blog } from '@/src/lib/supabase';
import { CalendarDays, Clock, User, Twitter, Linkedin, Link, Bookmark, Share2, Heart } from 'lucide-react';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function formatDate(iso?: string) {
  try {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function estimateReadTime(content: string) {
  const text = content ? content.replace(/<[^>]+>/g, ' ') : '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

type TocItem = { id: string; text: string; level: number };

const TableOfContents = ({ items, activeId, onNavigate }: { items: TocItem[]; activeId: string | null; onNavigate: (id: string) => void }) => (
  <div className="hidden lg:block sticky top-24">
    <div className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">On this page</div>
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id}>
          <button
            className={`text-left text-sm ${activeId === it.id ? 'text-blue-600 font-semibold' : 'text-slate-600 dark:text-slate-400'} ${it.level === 3 ? 'pl-4' : ''}`}
            onClick={() => onNavigate(it.id)}
          >
            {it.text}
          </button>
        </li>
      ))}
    </ul>
    <div className="mt-8 flex flex-col gap-3">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(document.title)}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Twitter className="w-4 h-4" /> Share on Twitter
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(document.title)}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Linkedin className="w-4 h-4" /> Share on LinkedIn
      </a>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5"
        onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); } catch {} }}
      >
        <Link className="w-4 h-4" /> Copy Link
      </button>
    </div>
  </div>
);

const ProgressBar = ({ targetRef }: { targetRef: React.RefObject<HTMLDivElement> }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progressed = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      const p = total > 0 ? Math.min(100, Math.max(0, (progressed / total) * 100)) : 0;
      setPct(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [targetRef]);
  return <div className="fixed left-0 top-0 h-1 bg-blue-600 z-50" style={{ width: `${pct}%` }} />;
};

const StickyHeader = ({ title, onShare, onBookmark, bookmarked, onLike, likes }: { title: string; onShare: () => void; onBookmark: () => void; bookmarked: boolean; onLike: () => void; likes: number }) => (
  <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur bg-white/70 dark:bg-black/60 border-b border-slate-200 dark:border-slate-800 hidden md:block">
    <div className="max-w-screen-lg mx-auto px-6 md:px-12 lg:px-16 h-14 flex items-center justify-between">
      <div className="truncate font-semibold text-slate-900 dark:text-white">{title}</div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800" onClick={onLike}>
          <Heart className="w-4 h-4" /> {likes}
        </button>
        <button className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center" onClick={onBookmark} aria-label="Bookmark">
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
        </button>
        <button className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center" onClick={onShare} aria-label="Share">
          <Share2 className="w-4 h-4" />
        </button>
        <a href="/discovery-call" className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold">Book Consultation</a>
      </div>
    </div>
  </div>
);

const Skeleton = () => (
  <div className="max-w-screen-lg mx-auto px-6 md:px-12 lg:px-16 py-16">
    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 animate-pulse mb-6 rounded"></div>
    <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 animate-pulse mb-4 rounded"></div>
    <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 animate-pulse mb-6 rounded"></div>
    <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 animate-pulse mb-10 rounded-xl"></div>
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-4 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
      ))}
    </div>
  </div>
);

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [prevNext, setPrevNext] = useState<{ prev: Blog | null; next: Blog | null }>({ prev: null, next: null });
  const [images, setImages] = useState<string[]>([]);

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
          setPageMeta({ title: title, description: desc, url: window.location.origin + `/blog/${data.slug}`, image: data.coverImageUrl });
          injectJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            'headline': title,
            'description': desc,
            'image': data.coverImageUrl ? [data.coverImageUrl] : undefined,
            'datePublished': data.publishedAt,
            'dateModified': data.updatedAt,
            'author': data.authorName ? { '@type': 'Person', 'name': data.authorName } : undefined,
            'publisher': { '@type': 'Organization', 'name': 'Webnexa AI' },
            'mainEntityOfPage': { '@type': 'WebPage', '@id': window.location.origin + `/blog/${data.slug}` },
            'url': window.location.origin + `/blog/${data.slug}`,
            'keywords': (data.tags || []).join(', ')
          });
          try {
            const all = await getAllBlogs();
            const filtered = (all || [])
              .filter(b => b.slug !== data.slug)
              .filter(b => {
                if (!data.tags || data.tags.length === 0) return true;
                const tset = new Set((data.tags || []).map(x => x.toLowerCase()));
                return (b.tags || []).some(x => tset.has(x.toLowerCase()));
              })
              .slice(0, 3);
            setRelated(filtered);
            const sorted = (all || []).slice().sort((a, b) => {
              const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
              const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
              return ad - bd;
            });
            const idx = sorted.findIndex(b => b.slug === data.slug);
            const prev = idx > 0 ? sorted[idx - 1] : null;
            const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
            setPrevNext({ prev, next });
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const hs = Array.from(el.querySelectorAll('h2, h3')) as HTMLHeadingElement[];
    const items: TocItem[] = hs.map(h => {
      const id = h.id || slugify(h.textContent || '');
      h.id = id;
      return { id, text: h.textContent || '', level: h.tagName.toLowerCase() === 'h3' ? 3 : 2 };
    });
    setToc(items);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0.1 }
    );
    hs.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [blog]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const found = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
    const urls = found.map(i => i.src).filter(Boolean);
    setImages(urls);
  }, [blog]);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setShowSticky(rect.top < -80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const bm = localStorage.getItem(`bookmark-${slug}`) === '1';
    setBookmarked(bm);
    const lc = parseInt(localStorage.getItem(`likes-${slug}`) || '0', 10);
    setLikes(isNaN(lc) ? 0 : lc);
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    const title = document.title;
    const tw = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(tw, '_blank');
  };

  const handleBookmark = () => {
    const v = !bookmarked;
    setBookmarked(v);
    if (slug) localStorage.setItem(`bookmark-${slug}`, v ? '1' : '0');
  };

  const handleLike = () => {
    const n = likes + 1;
    setLikes(n);
    if (slug) localStorage.setItem(`likes-${slug}`, String(n));
  };

  const readTime = useMemo(() => estimateReadTime(blog?.content || ''), [blog]);
  const category = useMemo(() => (blog?.tags && blog.tags[0]) || 'General', [blog]);

  if (loading) return <Skeleton />;
  if (!blog) return <div className="max-w-screen-lg mx-auto px-6 md:px-12 lg:px-16 py-16">Not found</div>;

  return (
    <div className="bg-white dark:bg-black">
      <ProgressBar targetRef={contentRef} />
      {showSticky && blog && (
        <StickyHeader
          title={blog.title}
          onShare={handleShare}
          onBookmark={handleBookmark}
          bookmarked={bookmarked}
          onLike={handleLike}
          likes={likes}
        />
      )}
      <div className="max-w-screen-lg mx-auto px-6 md:px-12 lg:px-16 py-8">
        <nav className="text-sm text-slate-500 mb-6">
          <a href="/" className="hover:underline">Home</a>
          <span className="mx-2">›</span>
          <a href="/blog" className="hover:underline">Blog</a>
          <span className="mx-2">›</span>
          <a href="/blog" className="hover:underline">{category}</a>
          <span className="mx-2">›</span>
          <span className="text-slate-700 dark:text-slate-300">{blog.title}</span>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          {(blog.tags || []).map((t) => (
            <span key={t} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{t}</span>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-950 dark:text-white">{blog.title}</h1>
        <div className="flex items-center gap-3 mb-8">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800" onClick={handleLike}>
            <Heart className="w-4 h-4" /> {likes}
          </button>
          <button className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center" onClick={handleBookmark} aria-label="Bookmark">
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
          <button className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center" onClick={handleShare} aria-label="Share">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 mb-8">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-semibold">{blog.authorName || 'Webnexa Team'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{formatDate(blog.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{readTime}</span>
          </div>
        </div>

        {blog.coverImageUrl && (
          <figure className="mb-10">
            <img src={blog.coverImageUrl} alt={blog.coverImageAlt || blog.title} className="w-full rounded-xl shadow-xl" loading="lazy" />
            {blog.coverImageAlt && <figcaption className="mt-2 text-sm text-slate-500">{blog.coverImageAlt}</figcaption>}
          </figure>
        )}

        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          <TableOfContents
            items={toc}
            activeId={activeId}
            onNavigate={(id) => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />

          <div>
            <div className="lg:hidden mb-4">
              <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800" onClick={() => setMobileTocOpen(!mobileTocOpen)}>
                On this page
              </button>
              {mobileTocOpen && (
                <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  {toc.map(it => (
                    <div key={it.id}>
                      <button className={`text-left w-full py-1 ${activeId === it.id ? 'text-blue-600 font-semibold' : 'text-slate-600 dark:text-slate-400'} ${it.level === 3 ? 'pl-4' : ''}`} onClick={() => {
                        const el = document.getElementById(it.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setMobileTocOpen(false);
                      }}>{it.text}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {images.filter(u => u !== blog.coverImageUrl).length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Images</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {images.filter(u => u !== blog.coverImageUrl).map((u, idx) => (
                    <a key={u + idx} href={u} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img src={u} alt={blog.title} className="w-full h-40 object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div ref={contentRef} className="prose prose-lg dark:prose-invert max-w-none">
              { /<[^>]+>/.test(blog.content || '') ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <div className="whitespace-pre-wrap">{blog.content}</div>
              )}
            </div>

            <div className="mt-12 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-lg font-bold">Ready to automate this workflow?</div>
                  <div className="text-slate-600 dark:text-slate-400">Book a free strategy call and we’ll design the system.</div>
                </div>
                <div className="flex gap-3">
                  <a href="/discovery-call" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Book Consultation</a>
                  <a href="/#services" className="px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5">Explore Services</a>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">
                {(blog.authorName || 'W').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="font-bold">{blog.authorName || 'Webnexa Team'}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">AI Automation</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">We build systems that capture leads, automate workflows, and scale operations.</div>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
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

            {(prevNext.prev || prevNext.next) && (
              <div className="mt-12">
                <div className="grid md:grid-cols-2 gap-6">
                  {prevNext.prev && (
                    <a href={`/blog/${prevNext.prev.slug}`} className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-colors">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Previous</div>
                      <div className="text-lg font-bold group-hover:text-blue-600">{prevNext.prev.title}</div>
                    </a>
                  )}
                  {prevNext.next && (
                    <a href={`/blog/${prevNext.next.slug}`} className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-colors text-right md:text-left">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Next</div>
                      <div className="text-lg font-bold group-hover:text-blue-600">{prevNext.next.title}</div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
