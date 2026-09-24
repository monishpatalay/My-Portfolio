# monishpatalay.dev

Personal portfolio of Monish Patalay: AI engineer and full-stack developer. Live at **[www.monishpatalay.dev](https://www.monishpatalay.dev)**.

Next.js 16 (App Router) · React 19 · Sanity CMS · Mux video · GSAP + Lenis · Three.js particles · an AI assistant grounded in the site's own content.

> **Next.js 16 note:** APIs and conventions differ from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before changing metadata, routing or rendering (see `AGENTS.md`).

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in the values below
pnpm dev                     # http://localhost:3000 — Studio at /studio
```

Without Sanity credentials the site still runs, serving the reviewed fallback copy in `lib/content/data.ts`.

### Environment variables

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, structured data | `https://www.monishpatalay.dev` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | CMS content | Falls back to `data.ts` when unset |
| `SANITY_REVALIDATE_SECRET` | `/api/revalidate` webhook | Sanity webhook secret, so edits go live without a redeploy |
| `CHAT_ENABLED`, `OPENROUTER_API_KEY`, `CHAT_MODEL`, `CHAT_MODEL_FALLBACK` | AI assistant | |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_SALT` | Chat rate limiting | **Required in production** — the chat fails closed without them |
| `CHAT_DAILY_GLOBAL_LIMIT` | Chat cost cap | Site-wide requests per day (default 100) |

`SANITY_WRITE_TOKEN` is only for the seed script and CI — never put it in the Vercel runtime.

## Editing content (Sanity)

Everything visitors read comes from Sanity, edited at `/studio`. Schema: `sanity/schemaTypes/index.ts`; queries and validation: `lib/content/server.ts`.

| Document | Drives |
|---|---|
| **About statement** | The "A builder at heart." section (heading, paragraph, small note). The assistant uses the paragraph too. |
| **Project** | Work rail, `/work`, and each `/work/[slug]` case study, including GitHub/live links |
| **Experience**, **Education** | The two timelines |
| **Skill category**, **Stat**, **Achievement** | Skills cloud, numbers strip, achievements list |
| **Chat answer** | Curated answers the assistant treats as the source of truth |

- **Hover preview videos:** upload any video file to a project's *Hover preview video* field. [Mux](https://mux.com) encodes it into an adaptive stream (up to 1080p, `plus` quality) and makes the poster from the thumbnail frame you pick. The Mux API token is stored in Sanity via the plugin's setup screen, not in env vars.
- **SEO title / SEO description** on each project control its Google result. Keep titles under 45 characters (" — Monish Patalay" is appended) and descriptions at 110–160. Empty falls back to the title and summary.
- Invalid or half-filled documents never blank the site: rows that fail validation are logged and the reviewed fallback is served instead.

## SEO

What is in place, and what to keep true when adding pages:

- **One canonical host.** The apex domain and `http://` redirect to `https://www.` (Vercel domain settings). The production `*.vercel.app` alias redirects in `proxy.ts` (`ALIAS_HOST`) — **update that constant if the alias ever changes.** Preview deployments send `noindex`.
- **`app/robots.ts`, `app/sitemap.ts`** — the sitemap lists every case study from Sanity. `/studio` and `/api` are disallowed; the Studio page is also `noindex`.
- **Metadata** — unique title and description per route. Case studies set a canonical URL and use the Sanity SEO fields.
- **Open Graph / social cards** — `app/opengraph-image.tsx` for the site, `app/work/[slug]/opengraph-image.tsx` per project (title, tech, cover). Every page sets `og:url`, `og:type` and `og:site_name` from `lib/site.ts`. A page that defines its own `openGraph` **replaces** the layout's, so spread `baseOpenGraph` and include `images` when you add one.
- **Structured data** — `Person` on the home page (job title, location, skills, profiles); `SoftwareSourceCode` plus a `BreadcrumbList` on each case study.
- **Server-rendered text** — all page copy is in the initial HTML, so the intro overlay and GSAP letter-splitting never hide content from crawlers.

Check after SEO-related changes: `curl` a page and read the `<head>`; run [Rich Results Test](https://search.google.com/test/rich-results) on a case study; watch Search Console for coverage.

## Motion and performance notes

- **Intro loader** (`components/ui/Preloader.tsx`): 5 s, only when a visit *starts* on the home page, once per browser tab. A pre-paint script in `app/layout.tsx` marks returning tabs so reloads never flash it; deep links from search open straight onto content.
- **Particles** (`components/particles/ParticleCanvas.tsx`): GPU simulation with cursor repulsion. Tune `REPEL_RADIUS`, `REPEL_RATE` and `MORPH_RATE` at the top of the file.
- **Cursor**: custom cursor and a soft spotlight (`components/ui/CursorGlow.tsx`, styled in `styles/media-cursor.css`) on mouse/trackpad devices. The cursor hides while it rests on a playing project preview.
- **Security headers**: a nonce-based CSP is built per request in `proxy.ts`. New third-party hosts (fonts, media, APIs) must be added there or they are silently blocked.

## AI assistant

`app/api/chat` answers only from the site's CMS content (`lib/chat/server.ts`). Every request is origin-checked and rate-limited per visitor (hashed IP) and site-wide through Upstash Redis.

Visitors who tick **Help improve** have their question, the answer and their rating saved for 90 days. Review them locally:

```bash
pnpm feedback          # newest first
pnpm feedback --down   # only "Not quite" answers
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm check` | lint + typecheck + unit tests + build — run before pushing |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright suite against a production build (see `tests/e2e/README.md`) |
| `pnpm feedback` | Review saved chat feedback |
| `pnpm exec tsx scripts/seed-sanity.ts` | Seed an empty Sanity dataset from `data.ts` (dry run; `--commit` writes) |

## Deploying

- **Site:** Vercel deploys `main` automatically. Sanity edits go live through the `/api/revalidate` webhook without a redeploy.
- **Standalone Studio** (`monish-portfolio.sanity.studio`): not deployed by Vercel. After schema changes run `pnpm exec sanity deploy`, or it keeps the old fields. The embedded Studio at `/studio` updates with the site.
