# Blog API

## Endpoint
- Base URL: `VITE_SUPABASE_URL`
- Create Blog: `POST {VITE_SUPABASE_URL}/rest/v1/blogs`

## Headers
- `Content-Type: application/json`
- `apikey: {VITEAuthorization_SUPABASE_ANON_KEY}`
- `: Bearer {VITE_SUPABASE_ANON_KEY}`
- `Prefer: return=representation`

Server-side (optional):
- Use `Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}` for elevated permissions

## Payload Fields
- `title` (string)
- `slug` (string)
- `excerpt` (string, optional)
- `content` (string, required) — HTML string. Rendered directly in the blog detail page.
- `coverImageUrl` (string, optional)
- `coverImageAlt` (string, optional)
- `authorName` (string, optional)
- `tags` (string[], optional)
- `metaTitle` (string, optional)
- `metaDescription` (string, optional)
- `publishedAt` (ISO string, optional)
- `updatedAt` (ISO string, optional)

## cURL Example
```bash
curl -X POST "$VITE_SUPABASE_URL/rest/v1/blogs" \
  -H "Content-Type: application/json" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Example Post",
    "slug": "example-post",
    "excerpt": "Short summary...",
    "content": "<p>HTML or Markdown content here</p>",
    "coverImageUrl": "https://.../image.jpg",
    "coverImageAlt": "Cover image alt",
    "authorName": "Webnexa AI",
    "tags": ["ai", "automation"],
    "metaTitle": "Example Post",
    "metaDescription": "Short summary...",
    "publishedAt": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'",
    "updatedAt": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
  }'
```

## JavaScript Example
```js
const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/blogs`;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const payload = {
  title: 'Example Post',
  slug: 'example-post',
  excerpt: 'Short summary...',
  content: '<h2>Introduction</h2><p>This content is <strong>HTML</strong> and will be rendered on the blog page.</p><ul><li>Point A</li><li>Point B</li></ul>',
  coverImageUrl: 'https://.../image.jpg',
  coverImageAlt: 'Cover image alt',
  authorName: 'Webnexa AI',
  tags: ['ai', 'automation'],
  metaTitle: 'Example Post',
  metaDescription: 'Short summary...',
  publishedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: 'return=representation',
  },
  body: JSON.stringify(payload),
});
const created = await res.json();
```

## Optional: Upload Cover Image
- Upload: `POST {VITE_SUPABASE_URL}/storage/v1/object/blog-images/{path}`
- Headers:
  - `Authorization: Bearer {VITE_SUPABASE_ANON_KEY}`
  - `apikey: {VITE_SUPABASE_ANON_KEY}`
  - `Content-Type: image/jpeg` (or appropriate)
- Public URL: `GET {VITE_SUPABASE_URL}/storage/v1/object/public/blog-images/{path}`

## Notes
- Ensure RLS policies on `blogs` allow inserts for the role used.
- App insert helper: `src/lib/supabase.ts:48-57`
- Cover image upload usage: `src/pages/PostBlog.tsx:76-86`
- Content is injected as HTML in the renderer: `src/pages/BlogDetail.tsx:376`
