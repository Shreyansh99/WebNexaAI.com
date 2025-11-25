# Webnexa AI App Guide

This document explains the project’s architecture, implementation details, data flow, configuration, and how to run and extend the app.

## Overview
- Framework: `react` with `react-router-dom` for SPA routing.
- Bundler/Dev server: `vite`.
- Styling: Tailwind CSS via CDN configured in `index.html`.
- Icons: `lucide-react`.
- Backend-as-a-service: `@supabase/supabase-js` for database and storage.
- Deployment: SPA rewrites configured via `vercel.json`.

## Project Structure
- `index.html`: Tailwind CDN config, import maps for React/Lucide, root mount.
- `index.tsx`: React bootstrap that renders `App` into `#root`.
- `App.tsx`: Main application component. Sets up router, header/footer, home sections, and routes.
- `src/lib/supabase.ts`: Supabase client, blog data helpers, and SEO helpers.
- `src/pages/BlogList.tsx`: Lists blog posts.
- `src/pages/BlogDetail.tsx`: Displays a single blog post with TOC, metadata, and related posts.
- `src/pages/PostBlog.tsx`: Allows creating new blog posts, including image upload to Supabase Storage.
- `vite.config.ts`: Vite configuration with aliases and env injection.
- `tsconfig.json`: TypeScript configuration with path alias `@/*` to project root.
- `vercel.json`: SPA rewrite rules.

## Environment Configuration
Set the following variables in `.env` (or your hosting environment):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase public anon key
- `GEMINI_API_KEY`: Presently injected into the client build but not used by app code

Client-side Supabase initialization reads `import.meta.env` values:
- `src/lib/supabase.ts:3-10`

Security note:
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser; service-role keys must only be used on a trusted server.

## Routing
SPA routes are defined in `App.tsx:1031-1044`:
- `/` → `HomePage` (composed sections inside `App.tsx`)
- `/blog` → `BlogList`
- `/blog/:slug` → `BlogDetail`
- `/postblog` → `PostBlog`

Navigation helpers handle in-page anchors smoothly:
- `App.tsx:211-227` (`handleNavClick`)

Vercel rewrite ensures all paths serve `index.html`:
- `vercel.json:1-5`

## Supabase Client and Helpers
Supabase client creation and helpers live in `src/lib/supabase.ts`:
- Client setup: `src/lib/supabase.ts:1-11`
- Blog type: `src/lib/supabase.ts:12-26`
- Fetch all blogs: `src/lib/supabase.ts:28-35`
- Fetch by slug: `src/lib/supabase.ts:37-46`
- Create blog: `src/lib/supabase.ts:48-57`
- SEO meta helpers:
  - `setPageMeta`: `src/lib/supabase.ts:59-91`
  - `injectJsonLd`: `src/lib/supabase.ts:93-101`

### Database Expectations
`blogs` table matching the `Blog` type:
- `id` (uuid or text)
- `title` (text)
- `slug` (text, unique)
- `excerpt` (text, optional)
- `content` (text or longtext)
- `coverImageUrl` (text, optional)
- `coverImageAlt` (text, optional)
- `authorName` (text, optional)
- `tags` (array/text[], optional)
- `metaTitle` (text, optional)
- `metaDescription` (text, optional)
- `publishedAt` (timestamptz)
- `updatedAt` (timestamptz)

Row Level Security (RLS):
- Reading (`select`) requires a policy to allow public reads if desired.
- Creating (`insert`) from the client requires a policy permitting the anon role to insert, or a server endpoint to perform inserts with service-role key.

### Storage Expectations
Bucket `blog-images` with public read access (or serve via signed URLs). Client uploads occur in `PostBlog`:
- Cover image upload path: `post slug` + timestamp
- Body image upload path: `body/` + timestamp

## Pages and Features

### Blog List (`src/pages/BlogList.tsx`)
- Fetches posts via `getAllBlogs` and renders a responsive card grid.
- Sets page SEO metadata and JSON-LD schema for a blog index.
- References:
  - SEO: `src/pages/BlogList.tsx:8-19`
  - Data load: `src/pages/BlogList.tsx:20-28`
  - Rendering: `src/pages/BlogList.tsx:31-53`

### Blog Detail (`src/pages/BlogDetail.tsx`)
- Loads a post by `slug` and computes:
  - Read time
  - Category (first tag)
  - Table of Contents from `h2/h3` headings
- Sets detailed SEO metadata and `BlogPosting` JSON-LD.
- Displays related posts by matching tags.
- Includes a scroll progress bar.
- References:
  - Data load and meta: `src/pages/BlogDetail.tsx:99-157`
  - TOC generation: `src/pages/BlogDetail.tsx:158-177`
  - Progress bar: `src/pages/BlogDetail.tsx:66-83`
  - Related posts: `src/pages/BlogDetail.tsx:139-151`, `src/pages/BlogDetail.tsx:272-289`
  - Content render: `src/pages/BlogDetail.tsx:239-246`

### Post Blog (`src/pages/PostBlog.tsx`)
Two modes:
- Form Mode: traditional inputs for all fields.
- Canvas Mode: `contentEditable` rich text with basic formatting and image insertion.

Workflow:
1. Derive `slug` from title if not provided.
2. Optionally upload cover image to `blog-images` bucket.
3. Assemble payload and call `createBlog`.
4. Redirect to the new blog detail page.

Inline image uploads (content canvas):
- Upload to storage, then insert `<img>` into the editable content.

References:
- Submit handler: `src/pages/PostBlog.tsx:68-106`
- Cover image upload: `src/pages/PostBlog.tsx:74-85`
- Canvas image insertion: `src/pages/PostBlog.tsx:108-132`
- Canvas formatting toolbar: `src/pages/PostBlog.tsx:162-172` and `src/pages/PostBlog.tsx:186-202, 212-233`

## UI, Theming, and Sections
The home page is composed of sections within `App.tsx`:
- Components: `App.tsx:55-87` (`WebnexaLogo`, `Button`, animations with `FadeIn`)
- Theme toggle: `App.tsx:156-183` (`useTheme` persists to `localStorage` and toggles `dark` class)
- Sections: `Hero`, `TechMarquee`, `ProblemSolution`, `Stats`, `Services`, `Process`, `SocialProofBanner`, `CaseStudies`, `WhyUs`, `FAQ`, `CTA` (`App.tsx:294-1044`)
- Route layout: `App.tsx:1031-1044` (Header + Routes + Footer)

### Tailwind via CDN
Tailwind is configured in the page head and extended with custom fonts, colors, and animations:
- Config: `index.html:12-41, 42-59`
- Custom scrollbar & selection styles: `index.html:63-93`
- Import map for React/lucide: `index.html:94-103`

Typography (`prose` classes) are used for article content; ensure Tailwind’s Typography plugin is enabled when using a bundler setup or keep using CDN configuration that provides equivalent styles.

## Build and Run
- Install dependencies: `npm install`
- Development: `npm run dev` (serves on `http://localhost:3000/` per `vite.config.ts:8-11`)
- Production build: `npm run build` → outputs to `dist/`
- Preview build: `npm run preview`

`vite.config.ts` details:
- Alias `@` → project root: `vite.config.ts:17-21`
- Env injection for `process.env.GEMINI_API_KEY`: `vite.config.ts:13-16`

## SEO and Sharing
SEO helpers normalize meta tags and canonical URLs:
- `setPageMeta`: `src/lib/supabase.ts:59-91`
- `injectJsonLd`: `src/lib/supabase.ts:93-101`

Pages call these helpers to set per-route metadata, improving share previews and search indexing.

## Data and Content Model
Content is stored as HTML or plaintext:
- Blog content can be rich HTML when using Canvas Mode.
- Rendering uses `dangerouslySetInnerHTML` for HTML content and `whitespace-pre-wrap` for plaintext.
- Heading tags (`h2`, `h3`) are parsed to build Table of Contents and enable smooth navigation.

## Security Considerations
- Keep `VITE_SUPABASE_ANON_KEY` public; it is designed for client usage with RLS.
- Never commit or expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or `.env` that ships to the browser; use it only on server-side endpoints.
- Use RLS policies to control who can insert/update rows in `blogs`. For public posting flows, either:
  - Gate posting behind authentication, or
  - Implement a server endpoint that validates input and performs `insert` with service-role key.

## Extending the App
- Add a new page:
  1. Create a component under `src/pages`.
  2. Import and add a `<Route>` in `App.tsx:1035-1040`.
- Add a new blog field:
  1. Update `Blog` type in `src/lib/supabase.ts`.
  2. Adjust PostBlog form/canvas and payload.
  3. Update database schema and RLS policies.
- Change storage behavior:
  - Switch to signed URLs or private buckets and generate public URLs on the server.

## Known Limitations
- No server-side rendering (SSR); SEO relies on client-side meta injection.
- Content editing uses `document.execCommand`, which is deprecated but widely supported; consider migrating to a modern rich-text editor for robust formatting.
- No automated tests included; adding unit/integration tests is recommended.

## Quick References
- Router setup: `App.tsx:1031-1044`
- Supabase client: `src/lib/supabase.ts:1-11`
- Fetch all blogs: `src/lib/supabase.ts:28-35`
- Fetch blog by slug: `src/lib/supabase.ts:37-46`
- Create blog: `src/lib/supabase.ts:48-57`
- Blog list page: `src/pages/BlogList.tsx:8-53`
- Blog detail page: `src/pages/BlogDetail.tsx:99-298`
- Post blog page: `src/pages/PostBlog.tsx:68-134, 139-172, 186-233`

