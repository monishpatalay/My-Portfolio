# Monish Patalay Portfolio v2 — Product Requirements Document

**Status:** Draft for review  
**Prepared by:** Monish Patalay  
**Prepared:** September 15, 2026  
**Owner:** Monish Patalay — M.S. Computer Science, California State University - Los Angeles (Aug 2024 – May 2026), targeting software / AI engineering roles (assumed — no source states a career target or job-search status; pending §26 Q1 and Q2)  
**Current site (v1):** [`monishpatalay/My-Portfolio`](https://github.com/monishpatalay/My-Portfolio) at commit `78c267c`, apparently live on `www.monishpatalay.dev` (the apex 308 to www and the commit id are directly verified; that www serves the v1 build is inferred from matching response headers and content length, and is confirmed by fetching the page body at M0 — see §26 Q13), with the résumé served separately at `resume.monishpatalay.dev`  
**Target:** A replacement personal portfolio (v2) on the same custom domain, deployed on Vercel, with v1 archived  

> **Implementation status, September 16, 2026 — read this before starting work.** The v1 chat endpoint fix in §2.2 (L3, server-side system prompt) is done and verified on the live v1 repo. A v2 scaffold already exists at `Portfolio/portfolio-v2/` (sibling to v1, not yet deployed): Next.js App Router + TypeScript, with `pnpm install` already run for gsap, @gsap/react, lenis, three, @react-three/fiber, @react-three/drei, motion, and @types/three. Built and verified (typecheck, build, lint, and a real browser check all pass): the full §12 design-token system in `styles/tokens.css` / `typography.css` / `motion.css`; the §14.2 one-ticker engine in `lib/motion/loop.ts` (Lenis + GSAP on a single frame, CustomEase registered from the same curves CSS uses); the §14.4 Full/Calm motion-mode context and pre-paint script in `lib/motion/governor.ts` and `app/layout.tsx`; the P0 `MotionToggle` component; the `Reveal` entrance primitive and `useMagnetic`/`Magnetic` hook; and chapter 1 (Hero) in `components/chapters/Hero.tsx` with the real, reviewed copy from §9.1, including the H10 rotating role-line component. Chapters 2–8, the Project Rail, the particle system, the AI assistant, the playground, and the Sanity CMS are **not** built yet — extend this scaffold rather than starting a new project or re-scaffolding what's listed above. Codex should read this file plus the existing code in `Portfolio/portfolio-v2/` before making changes.

---

## 1. Executive summary

This document specifies **version 2 of Monish Patalay's personal portfolio**. It replaces the site currently live at `www.monishpatalay.dev`, which was built on a forked MIT template and carries that template's 3D character, imagery and visual language. v2 is original work, built around Monish's own content, his own 3D hero, and a motion system that is the product rather than a decoration on top of it.

The site has five jobs:

1. **Get a recruiter the essentials in under 10 seconds:** who, target role, degree and dates, résumé, contact.
2. **Show engineering depth** through project case studies, not a list of GitHub links.
3. **Prove AI skill on the page itself**, with an assistant that answers from Monish's content in a voice fine-tuned on his own writing, plus an in-browser neural-network playground.
4. **Be the portfolio piece.** The UI and its motion are the primary exhibit. Every surface moves, and the visitor is meant to notice.
5. **Stay easy to update.** Monish edits everything in Sanity CMS, with no code and no redeploy.

Two experiences carry the site's identity:

- An **interactive GPU particle system** that forms the wordmark "MONISH PATALAY" and morphs into a new shape for every chapter as the visitor scrolls. It runs on every device class through a quality tier, unlike v1, which disables 3D entirely at 1024 px and below.
- A **horizontal Project Rail**: the pinned side-scrolling work section from v1, rebuilt so that a vertical scroll, a horizontal trackpad swipe, shift and wheel, the arrow keys, and a pointer drag all push it forward at one-to-one with the gesture. v1 drops horizontal gestures on the floor (§2.2 L13); v2 treats them as a first-class input.

**Quality bar:** Apple-level precision in typography, spacing, easing and restraint *of craft* — combined with maximal motion density. These are not in tension. Apple-level means every animation is measured, interruptible, correctly eased and never janky; motion-heavy means there are a great many of them, on every surface, at every scale. Precision is the constraint; quantity is the goal.

> Land → the name assembles out of particles → scroll a cinematic story → side-scroll the Project Rail → open a case study → ask the AI or play in the playground → download the résumé or get in touch.

---

## 2. Current site baseline (v1)

`My-Portfolio` is a Vite 5 + React 18.3 + TypeScript 5.5 single-page app deployed on Vercel. It is a fork of an MIT-licensed template (`LICENSE` reads "Copyright (c) 2025 Redoyanul Haque"; `package.json` is still named `moncy-portfolio`).

| Area | v1 implementation |
|---|---|
| Rendering | Client-only SPA, a single `index.html`, React Router routes `/`, `/myworks`, `/play` |
| Content | `src/config.ts` static fallback, replaced at runtime by a Sanity fetch in `SiteDataProvider` |
| 3D | Three.js rigged character (`character.enc`, AES-obfuscated, 1.54 MB) with head-follow, typing, blink and eyebrow hover; disabled at 1024 px and below |
| Motion | GSAP ScrollTrigger timelines for the first three sections, a custom text splitter, Lenis smooth scroll driven from `gsap.ticker` with `lagSmoothing(0)` |
| Loader | Percentage loader tied to model load, 20 s timeout, "Welcome" button, then a text intro |
| Sections | Landing, About, What I Do, Career, Education, Work (pinned horizontal rail), Tech Stack (video background), CTA, Contact |
| Work rail | `Work.tsx` pins `.work-section` and tweens `.work-flex` by a single baked `translateX`; renders `projects.slice(0, 5)` plus a "See All Works" CTA card |
| Extras | `/play`: chess against a WASM engine (`redoxchess.wasm`, actually Stockfish.js under GPL-3.0) plus a persona chat through `api/chat.js` on OpenRouter (`meta-llama/llama-3.3-70b-instruct`) |
| CMS | Sanity Studio v3 in `studio/`, six schema types, one GROQ query in `src/lib/sanity.ts` |
| Ops | Vercel Analytics and Speed Insights, security headers in `vercel.json`, SPA rewrite to `index.html` |
| Résumé | A separate `resume-site` repo whose `vercel.json` rewrites every path to `/resume.pdf`, served at `resume.monishpatalay.dev` |

### 2.1 What to keep

- One structured content source, editable in a CMS, with a static fallback that never leaves the page empty.
- Lenis driven from the GSAP ticker so ScrollTrigger never reads a stale scroll position — v1 already does this correctly and v2 keeps the exact wiring (§14.2).
- An error boundary around anything WebGL, and a guaranteed exit from every loading state.
- A server-side chat proxy with an origin allowlist, input validation and rate limiting.
- Cookieless Vercel analytics and the `vercel.json` security header set.
- The pinned horizontal work rail as a **concept**. It is the most memorable thing on v1 and it becomes the signature surface of v2 (§10).
- The "MP" monogram favicon (`#C2A4FF` on `#0B080C`), which is Monish's own asset and seeds the v2 palette (§12.2).

### 2.2 What to fix (lessons learned)

| # | v1 issue | Requirement for v2 |
|---|---|---|
| L1 | 3D is fully disabled at 1024 px and below, so mobile visitors get a flat site | Tiered particle quality on all devices, with a static poster only as the last resort (§15.5) |
| L2 | The 3D character is the template's shared asset, so nothing about it is Monish's | Original particle system built from his own wordmark and chapter shapes |
| L3 | The chat system prompt was assembled in the browser and the API accepted a client-sent `system` role, so any caller could use the endpoint as a general-purpose LLM proxy on paid credits. It is being moved server-side during this session | System prompt is built server-side only, always. The API accepts `user` and `assistant` roles only (§17.2) |
| L4 | In-memory, per-instance chat rate limiting (10 requests per minute) that resets on every cold start | Persistent rate limiting on Upstash Redis plus a hard provider spend cap (§17.3) |
| L5 | The chat persona claims to be the human ("you are NOT an AI assistant") | The assistant is disclosed as AI and speaks about Monish in the third person (§9.6) |
| L6 | GSAP uses global DOM selectors from scattered utils; `Cursor.tsx` binds `[data-cursor]` once at mount and never tears down its rAF loop; `splitText.ts` adds a new `ScrollTrigger` refresh listener on every call, doubling the listener count per refresh | All motion is scoped with `useGSAP` and refs, reverted on unmount and route change; every listener has a matching removal (§14.5) |
| L7 | Animates `display`, `max-height`, and per-character `filter: blur` | Only `transform`, `opacity`, `clip-path` and sparing `filter` are animated (§13.1) |
| L8 | The CMS fetch after a static fallback shifts layout and forces repeated `ScrollTrigger.refresh()` | Content is statically generated at build or revalidate time, so layout is final at first paint (§15.3) |
| L9 | SPA with a single title and no per-page link previews | Per-route metadata, Open Graph images, sitemap, JSON-LD (§19) |
| L10 | No `prefers-reduced-motion` support anywhere | Full reduced-motion parity plus an in-site motion toggle, both P0 (§13.1, §14.4) |
| L11 | Hardcoded email in the navbar; `WorkImage` fetches video from `src/assets`, a relative URL that 404s in production, and never revokes its blob URL | All contact data from the CMS; all media through CMS assets and `next/image` |
| L12 | The loader blocks on a 1.54 MB model with a 20 s timeout | Content first: the preloader is capped at 1800 ms and 3D is deferred until after LCP (§21.1) |
| L13 | **Horizontal trackpad gestures do nothing on the work rail.** Lenis is constructed with `gestureOrientation: "vertical"`, so a pure side-swipe returns early without calling `preventDefault`, and `body { overflow: hidden }` means the native fallback scrolls nothing. A diagonal gesture has its `deltaX` discarded entirely | The rail converts horizontal delta into forward travel through a single Lenis `virtualScroll` interceptor, scoped to the rail's pinned range (§10.2) |
| L14 | Shift and wheel is a coin flip: nothing handles `shiftKey`, so browsers that report it as `deltaX` hit L13 and do nothing, while browsers that keep it on `deltaY` scroll normally | The interceptor keys on `abs(deltaX) > abs(deltaY)`, so both browser behaviours work identically (§10.2) |
| L15 | The rail's travel distance is measured once at mount and baked into `end: "+=2180"` and `x: -2180`, so `invalidateOnRefresh` cannot help. Resizing 1440 to 1280 leaves roughly 1200 px of pinned nothing | Function-based `end` and `x` computed from `track.scrollWidth - viewport.clientWidth` on every refresh (§10.3) |
| L16 | `parseInt(getComputedStyle(box).padding)` reads the first value of a shorthand. At widths above 1400 px and heights at or below 900 px the computed value is `40px 80px`, so the last card lands 20 px off-screen on a 1440×900 laptop; an engine returning an empty string yields `NaN`, which propagates into `end` and `x` and kills the section | Longhand reads only (`paddingInlineStart`), and geometry from `scrollWidth`, never from CSS constants (§10.3) |
| L17 | The rail has no keyboard affordance at all: no `keydown` handler, no focus management, and no `:focus-visible` rule anywhere in `src/**.css` outside `Play.css` | Arrow, Home, End and Page keys move the rail; every card has a visible focus ring; the ends never trap the keyboard (§10.5) |
| L18 | No progress indicator, no counter, no drag, no snap, no inertia. The rail can rest with a card half cut by the viewport edge | Counter, progress bar, drag with throw, and proximity snap to card stops (§10.4, §10.6) |
| L19 | Lenis `duration: 1.7` and ScrollTrigger `scrub: 1` apply two serial easings to the same value, so the track visibly lags the gesture | Lenis is the only smoothing layer, so both pinned sections use `scrub: true` (§10.3, §13.10 J01). Numeric scrub smoothing is never used on a pinned timeline; on non-pinned effects it is permitted where the travel is under one second (H03, F02, CS02, T04, S03, ST04, SK06) |
| L20 | `Work.tsx` renders `projects.slice(0, 5)`, so the sixth project (Pose Estimation Rep Counter) is invisible on the home page; with one CMS project the formula produces a negative pin length | No slicing in components; below the travel threshold the rail renders as a static row (§10.7) |
| L21 | Index labels render `0{index + 1}`, producing `010` for a tenth project; heading order runs `h2` section, `h3` decorative number, `h4` project title | `String(i + 1).padStart(2, "0")`; heading order is `h2` section then `h3` card title (§10.9) |
| L22 | Rail images are bare `<img loading="lazy">` with no dimensions and no `sizes`, shipping full-size Sanity originals | `next/image` with explicit dimensions, a `sizes` attribute and LQIP blur placeholders (§10.8) |
| L23 | Resizing below 769 px while pinned leaves the rail translated, because the effect's dependency array is `[projects.length]` and never re-runs | Everything is inside `gsap.matchMedia()`, so a breakpoint change reverts the rail instead of stranding a transform (§10.3) |
| L24 | `.work-flex::before` and `::after` are `width: calc(50000vw)` hairlines (720,000 px wide at 1440) that exist only to fake infinite rules | A `repeating-linear-gradient` or a fixed 100 vw rule does the same for free (§13.2, G06) |
| L25 | Copy is written in the present tense ("Pursuing", "Maintaining a 3.9/4 GPA", GRA "2025 - Present") although the M.S. and the assistantship both ended in May 2026 | All dates and tense come from the CMS and are reviewed at M0; current status is an open question (§26 Q2) |

### 2.3 Migration from v1

**Content mapping.** Nothing is retyped by hand. `src/config.ts` in the working tree (which already contains CineMatch, Pose Estimation and `contact.resumeUrl`) plus the existing Sanity dataset are the input to a one-time migration script that writes v2 documents.

| v1 source | v2 entity | Changes |
|---|---|---|
| `siteSettings` plus `config.developer` / `social` / `contact` | `siteSettings` singleton | Keeps name, title, description, email, GitHub, LinkedIn, résumé URL. Adds `roleLines[]` (v1 hardcodes the hero lines in `Landing.tsx`), `availability` status and text, one canonical `location` string, `accentColor`, `portrait` (none exists yet) |
| `experience` | `experience` collection | `period` free string becomes `start` and `end` dates (nullable for present). `responsibilities[]` becomes `bullets[]`. Adds optional `metrics[]` so the stats chapter draws from the same records |
| `education` | `education` collection | Dates as above, plus an explicit `gpa` field. Achievements move out of `responsibilities` into their own type |
| Achievement strings inside education bullets, and the chat persona text | `achievement` collection (new) | Seeded with the IJSREM paper and its URL, ICPC Club founder, Hackathon Finalist, and 700+ DSA problems |
| `project` | `project` collection | Adds `slug` (required, unique), `featured`, `featuredOrder`, `year`, `status`, `metrics[]`, `role`, `body` (Portable Text case study), and `imageKind` (screenshot / promo / placeholder). `technologies` changes from a comma-separated string to a `techs[]` reference array, with a `split(",")` fallback during migration |
| `skillCategory` with its `develop` or `design` enum | `skill` collection grouped by category | The two-value enum is dropped. Groups follow the résumé: Languages, Frontend and Backend, AI and ML, Cloud and Data |
| `techStackItem` (55 items, logos from external CDNs) | `skill` documents with a local SVG icon | Logos are self-hosted, not fetched from jsDelivr, simpleicons, icons8 or huggingface. Which of the 24 pyramid items that are not on the résumé survive is an M0 decision (§26 Q8) |
| The hand-written chat persona in `api/chat.js` | Generated server-side from `siteSettings`, `about`, `experience`, `project`, `achievement` and `chatFaq` | Stops the persona drifting. The v1 persona already omits CineMatch, Pose Estimation and Cook |

**Reusable assets.** Carried forward: `favicon.svg` (the MP monogram), `images/cinematch.webp` and `images/pose-estimation.webp` (Monish's own 1920×1080 promo thumbnails, currently untracked in git — both are designed mock-UI cards rather than real screenshots, and must be labelled as such via `imageKind`), and `redoxchess.js` / `redoxchess.wasm` if the chess mode carries over (§9.5). **Not carried forward:** `models/character.enc` and its HDR environment, `video/video.webm`, `images/project-1..5.webp`, `images/placeholder.webp`, the tech-stack `.webp` images, and `images/drishti.png`, `votechain.png`, `floodhub.png`, `gamekroy.png`, `hektools.png`, `phoenix.png`, `redxchess.png`, `eie.png` — that last group is **another developer's project work** (`drishti.png` is signed "Redoyanul Haque") and must not appear on this site under any circumstances.

**Licensing.** `redoxchess.wasm` is Stockfish.js under GPL-3.0, compiled by Niklas Fiekas and renamed. If the chess mode ships, the playground must carry a visible attribution and a link to the licence, and the engine files stay as unmodified separate artefacts loaded by a Web Worker. This is the deciding factor in §26 Q6.

**Résumé subdomain.** `resume.monishpatalay.dev` keeps serving `resume.pdf` from the `resume-site` repo unchanged. v2's `/resume` route issues a 302 to the CMS-hosted PDF so that the canonical copy has exactly one owner; the subdomain stays as a memorable short link. Note that the live PDF (157,846 bytes, last modified 2026-09-10) is newer than the committed local copy (139,797 bytes, 2026-08-03) — the live one is authoritative and must be re-read before any copy is finalised (§26 Q3).

**Chat.** The v1 OpenRouter integration carries over in shape only: the same provider, the same origin allowlist idea, and message caps of the same kind — tightened in §17.2 from v1's 40 messages, 2,000 characters each and 8,000 total to 20, 1,000 and 6,000 — but rebuilt per §17 with a server-built system prompt, persistent limits, streaming, and a spend cap.

**Analytics.** `@vercel/analytics` and `@vercel/speed-insights` stay, with the custom event set in §20.1 added.

**URL redirects.** Permanent 308 redirects from the v1 routes, configured in `next.config`:

```
/myworks        →  /work
/play           →  /playground
/#work          →  /#work            (anchor preserved)
```

Any deep link that existed on v1 either resolves or lands on the 404 page, which offers search-free navigation back to `/work` (§9.7).

**SEO continuity.** `www.monishpatalay.dev` remains the canonical host, so no domain-level authority is lost. The sitemap is regenerated from Sanity slugs on publish. Before cutover, the v1 URL set is crawled and every path is mapped to a v2 destination or an explicit 410. After cutover the new sitemap is submitted to Google Search Console and the old one removed.

**Domain cutover and rollback.** v2 ships to a preview domain first (`v2.monishpatalay.dev`) for a full QA pass (§23). Cutover repoints the production alias on Vercel; the v1 deployment is kept live but unaliased for at least 30 days, so rollback is a single alias change. The apex keeps its 308 to www.

**Archiving v1.** After the 30-day window, the `My-Portfolio` repository is archived on GitHub with a README that points at v2, the uncommitted working-tree changes are committed first so nothing is lost, and the v1 Vercel project is paused rather than deleted.

---

## 3. Problem statement

Student and new-graduate portfolios fail in predictable ways, and the current v1 site hits several of them:

- **They look like templates.** v1 literally is one: a fork whose 3D character, hero imagery and half its `public/images` folder belong to another developer. Anything reused from it makes the work less Monish's, not more.
- **They bury the proof.** v1 gates the entire page behind a loader that waits on a 1.54 MB model with a 20-second timeout, and then shows a project list with no case studies, generic grey placeholder images on four of six projects, and no story about how anything was built.
- **They claim skills without showing them.** A 55-item tech pyramid is weaker evidence than one working AI feature and one in-browser model that a visitor can break.
- **They go stale.** v1's copy still says "Pursuing" and "2025 - Present" after both the degree and the assistantship ended in May 2026. v1 does have a CMS — the Studio carries `experience` and `education` types with editable `period` and `description` fields — but the site renders `src/config.ts` first and only swaps in Sanity data if the fetch succeeds, and those fields were never populated there. So the hardcoded fallback is what actually renders, and correcting it means editing TypeScript.
- **They are static where they should be alive.** v1's most interesting surface, the horizontal work rail, ignores the most natural gesture for it — a sideways trackpad swipe — and offers no keyboard path, no progress feedback, and no snap.

v2 has to be memorable, fast, credible and maintainable, and it has to demonstrate front-end and AI ability through the artefact itself rather than through a list of nouns.

---

## 4. Product vision and principles

A portfolio that behaves like a flagship product launch page for one person: scroll tells the story chapter by chapter, the interactive pieces double as live demonstrations of skill, and **motion is the medium**, not the garnish. A visitor should be unable to describe the site without describing how it moves.

### 4.1 Product principles

1. **Motion is the product.** Every section has an entrance and at least one scroll-linked behaviour. Every interactive element has hover, press and focus motion. There is ambient motion at rest on every route. If a surface is still, that is a bug, not restraint.
2. **Apple-level precision at maximum density.** Density is the goal; precision is the constraint. Every animation is measured, token-driven, interruptible, correctly eased and compositor-only. Volume never buys permission for jank.
3. **Content is never hidden behind animation.** Nothing is reachable only through a motion state. Text is legible at rest, at every point of every scrub, and with JavaScript disabled.
4. **Reduced motion is parity, not a penalty.** Calm mode is a complete, deliberately designed version of the site with the same content, hierarchy and features — not the site with its animations deleted.
5. **The visitor can turn it down.** An in-site Full / Calm toggle is P0, discoverable, and persists.
6. **Proof over claims.** Metrics with sources, architecture, trade-offs and working demos.
7. **Every device is first-class.** Phones get a tuned experience with real motion, not a degraded afterthought.
8. **Owner-maintainable.** Any content change happens in the CMS in minutes, with no code and no redeploy.
9. **Originality.** No template assets, no other developer's project images, no Apple fonts or product renders. Everything shipped is Monish's or licensed and attributed.

### 4.2 What replaces the old restraint rules

Conventional front-end guidance — a motion budget of one signature effect per section, "calm by default", "animate one or two key elements per view" — is explicitly **superseded** for this project. In its place:

- **Motion density rule:** every chapter carries at least one entrance, one scroll-linked effect and one ambient behaviour; every interactive element carries the full hover, press and focus triad (§13.1).
- **Simultaneity rule:** at most **three simultaneous focal motions** per viewport. Ambient and micro-interaction layers do not count toward that number. This is what keeps density from becoming noise.
- **Variety rule:** no two adjacent sections use the same entrance archetype. The vocabulary rotates through line reveal, mask reveal, stagger, character cascade and fade (§14.3).
- **Pin budget:** exactly two pinned sections on the home page (the Project Rail and the Journey). Everything else uses scrub without pin, or CSS `position: sticky`.
- **Readability floor:** body copy is never split per character, never parallaxed, never scrubbed below full opacity at rest, and never animated in a way that delays reading.

---

## 5. Goals and non-goals

### 5.1 Goals (launch)

| ID | Goal | Measure |
|---|---|---|
| G1 | Essentials in 10 seconds | Name, target role, degree and dates, résumé and contact reachable within the first viewport plus one scroll on a 375 px phone; usability test with 5 people, at least 4 succeed |
| G2 | Fast | Home LCP under 2.5 s, CLS under 0.1, INP under 200 ms at p75 on Vercel Speed Insights |
| G3a | Smooth on real hardware | 60 fps sustained on an M1-class laptop and a median of at least 55 fps on a mid-range phone, **unthrottled, at that device's assigned tier**, on the home page and on the Project Rail (manual device QA, §23) |
| G3b | Smooth under synthetic load | On desktop CI under a 4× CPU throttle, with the device tier pinned through `?tier=` and verified before sampling, at both tier 2 and tier 3: median frame time 18 ms or less, p95 30 ms or less, and zero long animation frames over 200 ms, on the home page and on the Project Rail (§21.2, §23). This is the release gate the CI blocker enforces |
| G4 | Motion coverage | 100% of sections have an entrance animation and a scroll-linked effect; 100% of interactive elements have hover, press and focus states; at least one ambient behaviour is running at rest in every chapter and on every route (audited as a checklist against §13.24) |
| G5 | Motion is noticed | In the same 5-person usability test, at least 4 of 5 describe the site unprompted in terms of movement, and none report difficulty reading |
| G6 | Motion is optional and safe | Calm mode reachable in one click from any route, zero content lost in Calm, zero animations flashing more than 3 times per second, reduced-motion E2E suite green |
| G7 | Rail feels one-to-one | Vertical wheel, horizontal trackpad delta, shift and wheel, drag, and arrow keys all advance the rail; a card edge is always aligned to the gutter at rest (§10.4, §10.12) |
| G8 | Owner-maintainable | Monish publishes a new case study in under 15 minutes with no code and no redeploy |
| G9 | Accessible | WCAG 2.2 AA; zero serious or critical axe violations on any route in both motion modes |
| G10 | AI cost-safe | Chat inference hard-capped at a target of 5 USD per month, fine-tuning runs at 10 USD or less each, persistent rate limits |
| G11 | Memorable | At least 15% of visitors click the résumé or a contact link within 60 days of launch |
| G12 | Sounds like Monish | He rates at least 8 of 10 sampled answers "sounds like me", and every fine-tuned candidate scores at least as well as production on the eval gate (§17.9) |

### 5.2 Non-goals for launch

- Blog, notes or MDX writing
- Internationalisation
- Visitor accounts, comments, guestbook, newsletter
- Storing full chat transcripts (only opt-in question text and ratings are kept; §17.8)
- Real-time or automatic training on visitor messages (every training example is owner-approved)
- Multi-owner or template productisation
- Native mobile app
- A custom analytics dashboard beyond Vercel
- Sound design (deferred to P1 with a mute-by-default toggle)

---

## 6. Target users

### 6.1 Primary persona: recruiter or university recruiter

- Screening new-grad and early-career candidates at volume; usually opens the link from LinkedIn on a phone.
- Time on site: 30 to 90 seconds.
- Needs: target role, degree and graduation date, location, top projects, résumé, contact.
- Success: finds the résumé and one impressive project without hunting.

### 6.2 Secondary persona: hiring manager or engineer

- Usually on desktop; reads one or two case studies closely.
- Needs: problem, approach, architecture, trade-offs, results, code links, and Monish's specific contribution on team projects.
- Success: leaves with a clear sense of technical depth and judgement. Often also the person who notices how the site is built, opens the network tab, and toggles reduced motion to see whether it was handled.

### 6.3 Tertiary persona: peers, professors, hackathon teammates

- Curious about the projects and the playground; likely to share the link.
- Success: tries the Neural Doodle or the chess mode and shares it.

### 6.4 Owner persona: Monish Patalay

- Comfortable in code but should not have to touch it for content.
- Needs: add and edit projects, experience, education, skills, stats, résumé file, availability status and chat FAQs from the Studio; write and approve assistant training examples; review the questions visitors asked.
- Success: a content change appears on the live site within roughly a minute of publishing.

---

## 7. Scope

### 7.1 P0 — Required for launch

- Home page with all eight chapters (§9.1)
- GPU particle hero with scroll morphing, pointer interaction, device tiers and a poster fallback (§15.5)
- Every pattern in the §13 motion catalog except the rows explicitly marked P1 — RT03, PG06 through PG09, and the chess half of TT02 — each assigned to a surface, including the global ambient layer, the cursor layer and the complete interaction triad on every control
- **In-site Full / Calm motion toggle**, applied before first paint, persisted, and treated as the site's reduced-motion implementation (§14.4)
- **Project Rail** on the home page with all input modes, snap, progress, per-card motion and the mobile and Calm layouts (§10)
- `/work` project index with category filter and animated layout
- `/work/[slug]` case-study template with rich content blocks and a shared-element transition
- AI assistant "Ask Monish's AI" with grounding, streaming, guardrails, persistent rate limits and a spend cap (§9.6, §17)
- Assistant feedback, opt-in question capture and the Studio review queue that feeds fine-tuning data (§17.8)
- `/playground` Neural Doodle: draw a digit, an in-browser neural net predicts it, plus a "Beat the Model" game mode (§9.5)
- Sanity CMS with the embedded Studio at `/studio`, schemas for all content, and webhook revalidation
- Résumé served from the CMS through `/resume`
- SEO: per-page metadata, static OG images, sitemap, robots, JSON-LD `Person`
- Accessibility: WCAG 2.2 AA, Calm parity, full keyboard access
- Analytics events (§20.1) and Speed Insights
- Security headers and CSP (§18.2)
- 404 page with the particle "404" formation (§9.7)
- v1 redirects, domain cutover and rollback plan (§2.3)

### 7.2 P1 — After launch

- First voice fine-tune of the assistant and the recurring retraining pipeline with eval gate, promotion and rollback (§17.7 to §17.11)
- Chess against the WASM engine as the playground's second mode, if the GPL-3.0 question resolves in its favour (§26 Q6)
- Per-project dynamic OG images
- Sanity Presentation tool and visual editing with draft preview
- Signature WebGL route wipe on menu-driven chapter jumps (§13.20, RT03)
- Chat suggested follow-up questions after each answer
- A "Now" section (currently building, reading, learning)
- Optional UI sound design with a mute-by-default toggle
- Staging Sanity dataset for preview deployments
- An invisible bot challenge on chat, only if abuse is observed

### 7.3 P2 — Explicitly deferred

- Blog and notes, internationalisation, guestbook, newsletter, visitor accounts, a second language for the assistant

---

## 8. Information architecture

```
/                       Home (8 chapters, Project Rail in chapter 4)
/work                   All projects (filterable, grid or list)
/work/[slug]            Project case study
/playground             Neural Doodle (P0) and chess (P1)
/resume                 302 → résumé PDF from the CMS
/studio/*               Sanity Studio (noindex, Sanity auth)
/api/chat               POST — AI assistant (streaming)
/api/chat/feedback      POST — thumbs rating and opt-in capture
/api/revalidate         POST — Sanity webhook (signed)
/sitemap.xml, /robots.txt, /opengraph-image
404                     Not found

Redirects (308): /myworks → /work, /play → /playground
```

**Global UI, present on every site route except `/studio`:**

- Glass navigation bar that morphs to a pill on scroll: wordmark, Work, Playground, Résumé, "Ask AI" button
- Motion toggle (Full / Calm) as a top-level, always-visible control in the glass nav beside the "Ask AI" button, mirrored in the footer. It is never behind an overflow menu, because G6 requires it to be reachable in **one** click from any route (§13.22, TM05)
- Chapter rail on the right edge of the home page
- AI assistant launcher (floating pill, bottom right) and panel
- Cursor aura layer on fine pointers; the native cursor is never hidden
- Persistent particle canvas in the root layout, so route changes morph the formation instead of re-initialising WebGL
- Footer: email, socials, résumé, local time, privacy note, motion note

**Navigation labels:** Work · Playground · Résumé · Ask AI

---

## 9. Page requirements

### 9.1 Home — chapter by chapter

The home page is a continuous scroll story. A single fixed particle canvas sits behind it and morphs per chapter; the background hue interpolates at chapter boundaries. Motion IDs refer to §13.

| # | Chapter | Theme | Content from the CMS | Particle shape |
|---|---|---|---|---|
| 1 | **Hero** | Dark | Eyebrow, name, rotating role line, CTAs "View work" and "Ask my AI", availability badge, scroll cue | Name wordmark |
| 2 | **Statement** | Dark | A two to three sentence personal statement | Statement glyph, breathing |
| 3 | **By the numbers** | Dark | Four to six stats in a bento grid | Bar-chart form, pointer-reactive |
| 4 | **Featured work** | Dark | Section header plus the **Project Rail** (§10) | Project grid |
| 5 | **Journey** | Light | Education, research, mentoring and internships on a drawn timeline | Timeline helix |
| 6 | **Skills and learning** | Light | Skill groups as bento, a tech marquee, current learning goals | Skills constellation |
| 7 | **Try it** | Light to dark | Two teaser cards: Playground and the AI assistant, each with a live mini-preview | Chat bubble |
| 8 | **Contact** | Dark | "Let's build something", email with copy button, LinkedIn, GitHub, résumé button, location, local time | Envelope, pointer-dispersible |

**Chapter 1 content (proposal, from v1 and the résumé; anything marked unresolved goes to §26)**

- **Eyebrow:** "M.S. Computer Science · California State University - Los Angeles · Aug 2024 – May 2026"
- **Name:** Monish Patalay
- **Role lines (rotating, three entries):** "AI Engineer" · "Full-Stack Developer" · "Builds and ships end to end"
- **Sub-line:** "Building intelligent systems and modern web applications — machine learning, computer vision, and production-grade software end to end." (condensed from `config.developer.description`)
- **Availability badge:** text unresolved. v1 states no availability anywhere and the M.S. ended in May 2026. Default if unanswered: the badge is hidden (`availability.status = hidden`) rather than guessed (§26 Q1).
- **CTAs:** "View work" scrolls to chapter 4; "Ask my AI" opens the assistant panel.

**Hero acceptance criteria**

- The `h1` name, the role line and the CTAs are server-rendered HTML and are the LCP element. They never wait on WebGL, and the LCP text starts visible — its reveal is transform and clip only, never an opacity fade from zero.
- The particle canvas mounts after first paint during browser idle time, then fades in over 800 ms.
- The rotating role line follows H10 (§13.7) for its dwell, durations and eases; it pauses on hover, on focus, when off-screen and on a hidden tab, and in Calm mode it shows the first role statically.
- The availability badge is hidden when `availability.status = hidden`.
- The scroll cue disappears on the first scroll input and never returns.

**Chapter 3 stats (proposal, exact numbers with sources)**

| Stat | Value | Source | Note |
|---|---|---|---|
| DSA problems solved | 700+ | Résumé, `config.ts`, v1 chat persona | Consistent in all three sources. The platform is not stated anywhere (§26 Q7) |
| Students mentored | 300+ | Résumé, `config.ts` | Smart Interviews, across 50+ live sessions |
| Model accuracy | 94.9% | Résumé, `config.ts`, Crop Expert README | Crop Expert, 8 classes, 9,612 PlantVillage images, single split with no cross-validation |
| Graduate GPA | 3.9 / 4 | Résumé, `config.ts`, persona | M.S. at Cal State LA |
| Students supported | 60+ | Résumé, `config.ts` | Graduate Research Assistant automation pipelines |
| Reporting time cut | 30% | Résumé, `config.ts` | Scripted Google Sheets data pipelines |

Numbers that appear in `config.ts` but not on the résumé — workshop participation up 25%, Airbnc "200+ users" and "UX speed 30%", Zyra "100+ users" and "35% response time" — are **excluded from v2 until Monish confirms them** (§26 Q7). The Zyra claims in particular conflict with that repository's own README, which describes a frontend-only app with no backend, no Docker and no CI.

**Chapter 4 featured projects (proposal, three of seven)**

| Project | Why it is featured | Evidence |
|---|---|---|
| **Cook — AI Meal Planner** | The most production-hardened thing in the portfolio: JWT auth, bcrypt, per-user ownership checks, rate limiting, Stripe with webhook signature verification, 8 pages and 20+ REST endpoints, plus an LLM agent ("Milo", Llama 3.3 70B through OpenRouter and the Vercel AI SDK) that plans 7 days and 21 slots from a 3-question flow with Zod-validated output and a deterministic fallback | Résumé and the repository README. Missing from v1 entirely, which is itself a reason to lead with it |
| **Crop Expert** | The clearest ML result with a real number: a 6-block CNN at 94.9% test accuracy over 8 classes and 9,612 PlantVillage images, deployed with a FastAPI service and an alternate TensorFlow Serving configuration, including a fixed 15-versus-8 class output mismatch | Résumé, `config.ts`, repository README |
| **CineMatch** | The best-verified live deployment: content-based recommender returning 5 titles from roughly 4,800 TMDb movies using CountVectorizer and cosine similarity, precomputed offline into static JSON so there are zero runtime API calls and no key in production, with tests on both the Python and the TypeScript side. It is live on `cinematch.monishpatalay.dev` (verified 200) and it is one of only two projects with a designed image asset that Monish owns, the other being Pose Estimation Rep Counter | `config.ts`, repository README, HTTP check on 2026-09-15 |

**This selection is a proposal, not a decision** (§26 Q4). The strongest alternate is the AI Spotify Library Organizer (hybrid regex plus Claude Haiku pipeline, 7 moods, a 4-source fallback chain, OAuth refresh and rate-limit backoff). Pose Estimation Rep Counter has the unique advantage of an associated publication. Every project on the canonical list appears on `/work` regardless of which three are featured — seven today, pending §26 Q5, which could drop Zyra AI and make it six.

**Chapter 5 journey entries (from the résumé where the entry exists there, otherwise from `config.ts`, which is flagged per entry)**

- Graduate Research Assistant, California State University - Los Angeles — Jan 2025 to May 2026, CA, USA (the résumé's own wording for this role; the site-wide location string is a separate decision, §26 Q9). Built automation tools in Google Apps Script for check-in, assignment distribution and progress tracking for 60+ students, replacing manual workflows end to end; cut weekly reporting time 30% with scripted Google Sheets data pipelines.
- Programming Mentor, Smart Interviews — Sep 2023 to Jun 2024, Hyderabad, India. Mentored 300+ students in data structures and algorithms across 50+ live sessions; raised average assessment scores 20% through code reviews and mock interviews; built problem sets and review sheets adopted program-wide.
- Machine Learning Intern, Defence Research and Development Organisation — Jan 2023 to Mar 2023, Hyderabad, India. CNN facial recognition in TensorFlow and OpenCV at 94% accuracy over 10k+ images, with inference latency cut 20% through preprocessing optimisation; TF-IDF features for a content-based movie recommender, 15% above baseline; benchmarked VGG16, ResNet and custom CNNs with runs tracked in MLflow; deployed through TensorFlow Serving with drift-detection alerts.
- M.S. Computer Science, California State University - Los Angeles — Aug 2024 to May 2026, GPA 3.9 / 4. Focus: machine learning, distributed systems, research, algorithms.
- B.Tech Artificial Intelligence and Machine Learning, CMR Engineering College — 2020 to 2024, Hyderabad, India, GPA 3.6 / 4. **This entry is not on the résumé: the degree, the dates, the GPA and the coursework come from `config.ts` alone, so the GPA in particular is confirmed with Monish before publishing (§26 Q7).** Coursework: data structures and algorithms, operating systems, databases, machine learning, artificial intelligence, system design.
- Achievements, rendered as timeline markers rather than entries: research paper in IJSREM, "Pose Estimation using MediaPipe"; founder of the ICPC Club at CMR Engineering College; hackathon finalist; 700+ DSA problems solved.

The DRDO recommender bullet and CineMatch are **different projects** and must be worded so a reader cannot conflate them — the DRDO work used TF-IDF, CineMatch uses plain bag-of-words. The ICPC Club is filed under CMR Engineering College, following the résumé, not under the M.S. as `config.ts` has it.

**Chapter 6 skill groups (résumé grouping, which is the most curated)**

- **Languages:** Python, Java, C++, JavaScript, TypeScript, SQL
- **Frontend and Backend:** React, Next.js, Node.js, Express.js, FastAPI, REST APIs, GraphQL
- **AI and ML:** TensorFlow, PyTorch, scikit-learn, OpenCV, CNNs, recommender systems, LLM integration (Claude and Gemini APIs), MLflow, TensorFlow Serving
- **Cloud and Data:** AWS, Docker, Kubernetes, GitHub Actions, Git, MongoDB, MySQL, Redis

Docker and Kubernetes appear on the résumé but were not found in any of the seven project repositories that were skimmed. They stay in the list, since coursework and unshipped work are legitimate, but no project card claims them unless its repository does.

**Chapter 8 contact details**

- Email: `officialmonishh@gmail.com` (copy button plus `mailto:`)
- GitHub: `https://github.com/monishpatalay`
- LinkedIn: `https://www.linkedin.com/in/monish-patalay/`
- Résumé: `https://resume.monishpatalay.dev` and the in-site `/resume` route
- Location: one canonical string, to be chosen between "Los Angeles, CA" (résumé) and "California, USA" (v1 persona). Default if unanswered: "Los Angeles, CA" (§26 Q9)
- Local time in Los Angeles, updating on the minute
- No phone number and no street address appear in site copy, in any CMS text field, or in the assistant's grounding content. The one deliberate exception is the résumé PDF, which is uploaded to the CMS as `siteSettings.resumeFile` and served through `/resume`: the contact block inside that document is Monish's own choice, and it is reviewed at M0 for anything he does not intend to publish (§26 Q3).

### 9.2 `/work` — project index

- Header "Work" with a character cascade reveal; an intro sentence from the CMS.
- Filter chips by category: All, AI and ML, Full Stack, Computer Vision, Web. Filtering re-lays out through GSAP Flip, with the active filter reflected in the URL as `?category=ai-ml`.
- A grid and list toggle, also Flip-driven, persisted per visitor.
- Cards or rows: cover image with blur-up, title, one-line summary, year, tech tags, and a "Case study" badge when a case-study body exists.
- Row hover on fine pointers shows a cursor-following preview image; on tier 3 it adds a WebGL RGB split keyed to pointer velocity.
- Click navigates to `/work/[slug]` with a shared-element morph on the cover image.
- Empty filter state: "No projects in this category yet."
- Acceptance: the grid is fully usable by keyboard, the filter state round-trips through the URL, and no filter change causes layout shift outside the grid.

### 9.3 `/work/[slug]` — case study

**Structure**

1. **Hero:** cover image or device mockup arriving from the rail card through the shared-element morph, title, one-line impact, meta row (role, timeframe, team size, status), and links to GitHub, Live and any demo video.
2. **At a glance:** three or four metric tiles with odometer counters, for example "94.9% test accuracy", "9,612 images", "8 classes".
3. **Body (Portable Text)** with custom blocks: section heading (auto-added to a sticky table of contents), rich paragraph, callout in Problem / Insight / Trade-off / Lesson variants, figure or gallery with a lightbox, code block highlighted at build time with a copy button, architecture diagram with caption, metrics row, before-and-after comparison slider, and self-hosted video that autoplays muted only while in view.
4. **Tech used:** linked skill chips.
5. **Next project** card that rises into view on overscroll, with navigation always explicit and never automatic.

**Requirements**

- A reading progress bar at the top, driven by CSS `animation-timeline: scroll(root)` where supported and by ScrollTrigger otherwise.
- The table of contents highlights the current section with a spring-animated indicator.
- Recommended authoring template: Problem, Constraints, Approach, Architecture, Challenges and trade-offs, Results, What I would do next.
- Acceptance: the page renders fully without JavaScript apart from interactive embeds, reaches Lighthouse performance 95 or above on mobile, and never leaves an empty container when an optional field is missing.

### 9.4 Device mockups

The pinned device showcase that an earlier draft of this document specified is removed from the home page (the Project Rail replaces it, §10). v1 never had one. Device mockup scenes survive in two places: **inside rail cards**, where a card can render its screenshot in an original CSS and SVG laptop or phone frame, and in the **case-study hero**, where a mockup can hold a short screen-swap sequence. Frames are drawn from scratch — no trademarked device renders, no Apple product imagery.

### 9.5 `/playground`

**Mode 1 — Neural Doodle (P0).** The visitor draws a digit from 0 to 9. A small neural network trained by Monish and running entirely in the browser predicts it live, showing animated probability bars and a network visualisation whose layers light up with activation strength.

- **Free draw (default):** prediction updates within 50 ms of each stroke end; a Clear button scatters the strokes as particles.
- **Beat the Model (game):** 10 rounds, each asking for a specific digit with a 10-second timer. A round counts when the model's top prediction matches the request. The results screen shows score, average confidence and best-recognised digit. Personal best is stored in `localStorage`. A Share button uses the Web Share API with a copy-link fallback.
- **Model:** MNIST-trained MLP (784 to 128 to 64 to 10, ReLU, softmax), trained by Monish in Python. The training script and a README live in `/ml` as a portfolio artefact in their own right.
- **Weights:** the network has 109,386 parameters, which is 427 KB as raw `Float32` and too large for the route budget, so weights ship **int8-quantised with per-layer scales** — a binary of roughly 107 KB plus a JSON manifest, lazy-loaded on mount and dequantised to `Float32` once in memory. This is the number §21.1 budgets.
- **Inference:** plain TypeScript matrix multiply, ReLU and softmax on the dequantised weights. No ML runtime dependency.
- **Preprocessing (MNIST-style):** crop to the bounding box, scale the longest side to 20 px, pad to 28×28, centre by centre of mass, normalise.
- **Accessibility alternative:** "Try a sample digit" buttons feed pre-drawn samples; predictions are announced through `aria-live="polite"` when a stroke ends; the game timer can be paused and extended.
- **Acceptance:** top-1 predictions match reference outputs for a 50-digit fixture in unit tests; manual doodle accuracy of at least 80% across 50 digits drawn by 3 people; route JavaScript at or under 80 KB gzipped excluding weights.

**Mode 2 — Chess against the engine (P1, proposal).** v1's `/play` chess board carries over as a second playground mode, reusing `chess.js` and the bundled WASM engine in a Web Worker, with pieces that drag with spring physics, legal-move dots that stagger in, an arcing animation on the engine's reply, a particle burst on capture, and a move list that animates each entry.

**This reuse is a proposal, not a decision.** The engine file is Stockfish.js under GPL-3.0 renamed to `redoxchess`, which means v2 must carry visible attribution and a licence link, and must keep the engine as an unmodified separate artefact. The alternative is to drop chess and ship a second Neural Doodle mode instead, such as "Draw a letter" or a live activation heat-map explorer (§26 Q6).

### 9.6 AI assistant — "Ask Monish's AI"

**Entry points:** the nav "Ask AI" button, a floating launcher pill, the chapter 7 teaser card, the keyboard shortcut for the command palette, and the `#ask` URL hash.

**Panel UX**

- Desktop: a 400 by 600 floating panel anchored bottom right, opening with a layout morph from the launcher. Mobile: a bottom sheet at 90 vh, draggable to dismiss.
- **Header:** "Monish's AI", the disclosure line "AI · can make mistakes", a reset button and a close button.
- **Empty state:** a short intro plus four suggested prompts from the CMS, for example:
  - "What has Monish built with AI?"
  - "What is Monish's strongest project?"
  - "Which languages and frameworks does Monish use most?"
  - "What did Monish do at DRDO?"
- **Streaming:** tokens stream in with a per-chunk fade and a typing indicator before the first token.
- **Answer formatting:** limited Markdown — bold, italics, lists, inline code and links. Internal links such as `/work/cinematch` render as project chips.
- **Fallback CTA:** when the model cannot answer from the content, it offers "Email Monish".
- **Errors:** a network failure shows "Couldn't reach the assistant. Try again."; a 429 shows "You're sending messages quickly — try again in a minute."; the daily cap shows "The assistant is resting for today. Email Monish instead."
- **Feedback:** thumbs up and thumbs down under each answer. The control is always shown, and what it does depends on the opt-in: with **Help improve off** the rating is emitted only as the anonymous aggregate `chat_feedback` analytics event (§20.1) with no question and no answer text, and nothing reaches `/api/chat/feedback`; with **Help improve on** the rating is stored alongside the question and answer under the 90-day TTL. The panel says which of the two is happening in one line beside the toggle, so a visitor is never given a control that silently discards their input.
- **Help improve (opt-in):** a toggle in the panel footer, **off by default**: "Save my questions to help Monish improve this assistant." A "What's saved?" link opens the plain-language explanation in §18.1.
- **Persistence:** the conversation lives only in component state and is lost on reload. Nothing is stored server-side unless the visitor turns Help improve on.

**Behavioural requirements**

- It introduces itself as "Monish's AI assistant" and refers to Monish in the third person. It never claims to be him.
- It answers only from the supplied content: profile, projects, experience, education, skills, achievements and FAQs. When the answer is not there: "I don't have that detail — you can ask Monish directly at officialmonishh@gmail.com."
- It politely declines unrelated tasks (coding help, essays, general chat) in one sentence and redirects to the portfolio.
- It never invents employers, dates, grades, metrics or links. The unverified `config.ts` metrics (§9.1) are not in its grounding content at all, so it cannot repeat them.
- It never commits on Monish's behalf about salary, start dates or relocation beyond what the CMS states.
- It ignores instructions that try to change these rules or reveal the system prompt.
- Answers stay concise: 120 words by default, bullets for lists.

**Acceptance (a 20-question eval set in the repository):** at least 18 of 20 factually correct; 5 of 5 off-topic prompts declined; 5 of 5 injection attempts resisted; zero fabricated facts.

### 9.7 404

The particle system forms "404" and then scatters with an outward impulse; the pointer **attracts** particles here instead of repelling them, which is the one place the interaction inverts. The headline decodes through a scramble on mount and again on hover. Clicking anywhere re-forms the digits. Below it sit three links: Home, Work and Playground. In Calm mode and on tier 1 the formation renders statically.

---

## 10. The Project Rail

> "Also, I want the similar project section. If I just side-scroll, it should move forward."

Home chapter 4 is a **pinned horizontal rail of featured project cards**. It is the direct descendant of v1's `Work.tsx` section and it replaces the pinned device showcase that an earlier draft of this document specified. The requirement that drives every decision below: **a sideways trackpad swipe moves the rail forward, one pixel of gesture to one pixel of travel** — which is exactly what v1 fails to do (§2.2 L13).

### 10.1 Shape

```
section#work[aria-labelledby="work-heading"]
├ header.rail-head    → h2#work-heading + counter "01 / 03" + progress bar
└ div.rail-viewport   → overflow: clip  (this is the pinned element)
  └ ol.rail-track[role="list"]                       (this is the x-tweened element)
    ├ li.rail-item × N → article.rail-card
    │   ├ figure.rail-media (mask) > img (parallax layer) + span.rail-dim
    │   ├ span.rail-index "03"  (aria-hidden)
    │   ├ h3 > a.rail-link[href="/work/slug"]   ← the card's single tab stop
    │   ├ p.rail-excerpt
    │   ├ ul.rail-tags > li × k
    │   └ div.rail-actions > a Code, a Live
    └ li.rail-item.rail-cta → the morphing "See all work" card
```

`.rail-viewport` uses `overflow: clip` rather than `overflow: hidden`, so it is not a scroll container: the browser cannot focus-scroll it sideways, and it never contributes to `document.scrollWidth`. This is the fix for v1's focus-scroll drift (§2.2 L17).

### 10.2 Inputs — one pipeline, four gestures

Horizontal wheel and trackpad input is intercepted **inside Lenis, through its documented `virtualScroll` hook**, scoped by scroll position to the rail's pinned range. The hook runs before Lenis destructures the deltas, so rewriting `data.deltaY` feeds the normal pipeline: one easing curve, one `preventDefault`, one scroll target. Alternatives were evaluated and rejected:

| Option | Verdict |
|---|---|
| Toggle `gestureOrientation: "both"` on pin enter and leave | Global mutable state on a shared instance, with no clamping — a fling at the rail's end keeps converting sideways swipes into page scroll past the rail, which is real hijacking. `ScrollTrigger.isActive` is also false at exactly progress 0, so the very first swipe at the rail start would be dropped |
| GSAP `Observer` with `type: "wheel"` plus `lenis.scrollTo` | A second wheel listener alongside Lenis's own. A diagonal gesture is counted twice, once as `deltaY` by Lenis and once as `deltaX` by Observer, and smoothed by two different curves |
| A raw `wheel` listener converting `deltaX` | The same double-count, and it hand-rolls what Lenis already normalises across wheel, trackpad and touch |
| **The `virtualScroll(data)` hook** | Chosen. Documented for exactly this ("manually modify the events before they get consumed"), runs once per event, and touches nothing outside the armed range |

The rule inside the hook is a pure function of the event and the rail's cached start and end, with no toggled state:

```
armed      = lenis.targetScroll ∈ [start − ARM_PX, end]      ARM_PX = 0.25 × innerHeight
horizontal = abs(deltaX) > abs(deltaY)     (shift+wheel lands on either axis; both work)

if (!armed || !horizontal) return true                  // never hijack anywhere else
lowerBound = targetScroll < start ? 0 : start − targetScroll   // pre-arm converts forward
                                                              // delta only; once pinned,
                                                              // backward travel is allowed
                                                              // back to the pin start
room = clamp(deltaX, lowerBound, end − targetScroll)
if (room === 0 || sign(room) !== sign(deltaX)) {          // at a boundary the clamp yields 0
  event.preventDefault(); return false                    // or flips sign; swallow it so the
}                                                         // gesture never reaches
                                                          // swipe-to-go-back
data.deltaY = room; data.deltaX = 0; return true          // Lenis does the rest
```

The hook registers through one module-level setter on the smooth-scroll module and is cleared on cleanup. One variable, no event bus.

**The four inputs, all mapped to the same scroll value:**

1. **Vertical wheel, trackpad or touch** — untouched. The pin converts vertical travel into horizontal translation, as in v1.
2. **Horizontal trackpad delta** — converted by the hook above, one pixel of gesture to one pixel of track translation.
3. **Shift and wheel** — the `abs(deltaX) > abs(deltaY)` test handles both browser behaviours identically, so the gesture is no longer a coin flip.
4. **Pointer drag** — a GSAP `Observer` on the viewport with `type: "pointer"` and `dragMinimum: 6`. Drag maps to `lenis.scrollTo(targetScroll - deltaX, { immediate: true })`. Release throws `velocityX × 0.28`, clamped into the rail's range, over 0.9 s on an expo-out curve, then snaps. A drag longer than 6 px installs a capture-phase click suppressor for one tick, so a throw never accidentally opens a project. Images carry `draggable={false}`. The cursor reads `grab` and then `grabbing`.

`overscroll-behavior-x: none` is applied to the document while the rail is armed, so a boundary swipe can never trigger browser back or forward.

### 10.3 The pinned timeline

```ts
const maxX = () => Math.max(0, track.scrollWidth - viewport.clientWidth);   // real geometry

const rail = gsap.timeline({ scrollTrigger: {
  trigger: section,
  start: "top top",
  end: () => "+=" + maxX(),        // function-based, re-measured on every refresh
  pin: viewport, pinSpacing: true, anticipatePin: 1,
  scrub: true,                     // Lenis is the only smoothing layer
  invalidateOnRefresh: true,
}});
rail.to(track, { x: () => -maxX(), ease: "none" });
```

- Travel distance comes from `track.scrollWidth - viewport.clientWidth`, never from CSS constants, so changing card padding or track margins cannot silently change the distance (§2.2 L15, L16).
- `ease: "none"` on the horizontal tween is mandatory, because every per-card trigger rides it through `containerAnimation`.
- A `ResizeObserver` on both the track and the viewport triggers a debounced `ScrollTrigger.refresh()` after 150 ms, catching font swaps, image decode and CMS content changes that never fire a window resize.
- Position is preserved across refresh: a `refreshInit` listener stores `st.progress`, and a `refresh` listener restores `lenis.scrollTo(st.start + p × (st.end - st.start), { immediate: true })`. Both listeners are removed on cleanup, unlike v1's leaking refresh listeners.
- Everything lives inside `useGSAP(..., { scope })` plus `gsap.matchMedia()`, so a breakpoint change **reverts** the rail instead of stranding a transform (§2.2 L23).
- The desktop rail is gated on **two** conditions, not one: the `gsap.matchMedia()` query `(min-width: 1024px) and (hover: hover) and (pointer: fine)` **and** `motionMode === 'full'` read from the React motion context, with the `useGSAP` effect keyed on the mode so flipping the in-site toggle reverts the pin immediately. A media query alone cannot see the in-site toggle, and §14.4 makes an explicit user choice outrank `prefers-reduced-motion`, so gating on `(prefers-reduced-motion: no-preference)` would leave the pin running for a visitor who chose Calm without an OS preference. Touch laptops, iPads and the 769 to 1024 tablet band that v1 pinned all get the native list instead.

### 10.4 Progress, counter and snap

- A counter reads "01 / 03" in tabular figures (three, because §9.1 proposes three featured projects); its digits roll on each snap completion. **The denominator is the project count and excludes the CTA card**, which is `aria-hidden` from the count while staying in the list, so an eight-project fixture reads "01 / 08" even though nine items render.
- A progress bar's `scaleX` tracks the rail trigger's progress directly.
- Snap uses `lenis/snap` with `type: "proximity"`, a distance threshold of half a card step, 140 ms of debounce and a 0.5 s duration. Stops are recomputed and re-added on every `ScrollTrigger.refresh()` as `start + clamp(card.offsetLeft - trackPaddingInlineStart, 0, maxX)`, with trailing stops that can never reach the left edge deduplicated onto the end. Padding is read from the **longhand** `paddingInlineStart`, never from a shorthand.
- ScrollTrigger's own `snap` is deliberately **not** used: it tweens the scroller directly and would fight Lenis for the same value.

### 10.5 Keyboard

A `keydown` listener on the section, gated on `focusin`:

- `ArrowRight` and `ArrowLeft` move one stop.
- `Home` and `End` jump to the first and last stop.
- `PageDown` and `PageUp` advance by one visible page of cards, but **fall through without `preventDefault` at the ends**, so a keyboard user is never trapped inside the pin.
- `ArrowUp` and `ArrowDown` stay native; they scroll the page, which advances the rail anyway.
- Modified keys and keys pressed inside an input are ignored.
- Each jump runs through `lenis.scrollTo(stop, { duration: 0.6 })`.
- `focusin` on a card scrolls that card's stop into view through Lenis, pre-empting the browser's own focus-scroll.

### 10.6 Per-card motion

Every card registers its own ScrollTrigger with `containerAnimation: rail` and horizontal `start: "left right"`, `end: "right left"`, so ScrollTrigger maps the positions onto the container tween's progress with no manual maths. Children of a `containerAnimation` cannot pin or snap, which is why both live on the parent.

| Effect | Implementation |
|---|---|
| Image parallax inside the mask (R06) | The `figure` is the mask with `overflow: clip` and a fixed aspect ratio; the image sits at `scale(1.12)` and scrubs `xPercent` from −6 to 6 across the card's traverse |
| Velocity skew (R07) | One `gsap.quickTo` on `skewX` at 0.45 s on a power3 curve, fed from `lenis.velocity`, clamped to ±7 degrees. Media only — the text stays crisp |
| Active-card focus (R05) | Scrubbed `scale` from 0.94 to 1 to 0.94, with a `.rail-dim` overlay going from 0.45 opacity to 0 and back. Opacity beats `filter: brightness` on the compositor, and keeping the dim on its own overlay leaves the card's text at full opacity throughout |
| Title split reveal | `SplitText` with `mask: "lines"` and `autoSplit: true`, toggle-triggered at `left 78%`, lines rising from `yPercent: 110` with a 0.05 s stagger on an expo-out curve |
| Index roll | Two digit spans in a clipped box, `yPercent` from 100 to 0, 40 ms apart, on the same trigger |
| Tag stagger | Chips rise 14 px with opacity, 0.04 s stagger, same trigger |
| Magnetic actions | `pointermove` within bounds drives `quickTo` on x and y at 0.32 of the pointer offset, released on `pointerleave`. Fine pointers and Full motion only |
| Cursor label | The cursor layer reads `data-cursor-label` through a **delegated** `pointerover` on `document`, so cards added by a later CMS change are covered: the rail background reads "Drag", card media and links read "View", buttons hide the label |

### 10.7 Card anatomy and the CTA card

Each card carries a cover image, an index, the title as the single stretched tab stop, a one-line excerpt, up to four tech tags, and Code and Live links. A card may render its screenshot inside an original CSS and SVG device frame (§9.4). Alternating cards may flip the media above or below the text, as v1 does, but the rhythm is driven by an explicit CMS field rather than `nth-child`.

The last item is the **CTA card**: a real `<Link href="/work" prefetch>` so middle-click, command-click and crawlers behave correctly. On a plain left click it prevents default, clones its own rect into a fixed overlay with the same background and radius, then runs `Flip.fit` from that cached rect to the full viewport over 0.65 s on an expo in-out curve, with the corner radius counter-scaled so it reads as going to zero, while the rail blurs slightly. Only `transform` and `opacity` animate: `inset`, `top`, `left`, `width` and `height` are banned by §13.1 rule 1, and the radius is counter-scaled rather than tweened because this overlay is a large full-viewport surface, where animating `border-radius` costs a repaint per frame — §13.1 rule 1 permits a radius tween only on the small isolated layers that N03 and AI02 use. CS10 already uses `Flip.fit` for the analogous lightbox case. The sequence is: cache the rect, run the `Flip.fit`, call `router.push('/work')`, then fade the overlay out once `/work` paints. `/work` opens on the same background colour, so the seam is invisible. Modified and middle clicks are never intercepted. In Calm mode it is a plain link.

**Below the travel threshold** — when `maxX()` is 0 or less, which happens legitimately with one or two featured projects — the component renders a static row or grid and skips the pin entirely. v1 would build a negative-length pin in this case.

### 10.8 Images

Sanity images go through `@sanity/image-url` behind `next/image` with explicit width and height, `sizes="(min-width: 1024px) 38vw, 86vw"`, `placeholder="blur"` from the asset's LQIP metadata, `quality={78}` and automatic AVIF or WebP. All rail images start lazy; one outer ScrollTrigger at `top bottom` fires once and flips them to eager, because horizontally translated cards otherwise decode late and pop mid-fling. An optional CMS-supplied `previewVideo` URL attaches to a muted, `playsInline`, `preload="none"` element on first hover of the active card and detaches on leave — never a `fetch()` of a bundler path, which is the v1 bug (§2.2 L11).

### 10.9 Accessibility

- `<section id="work" aria-labelledby="work-heading">` is a labelled region landmark.
- `<ol role="list">` with one `<li>` per project — the explicit role is needed because `list-style: none` drops list semantics in WebKit. Position in the set is then announced natively.
- One tab stop per card (the stretched title link) plus the Code and Live links. A card is never both `tabindex="0"` and wrapped in a link.
- The focus ring uses `outline` so it survives forced-colors mode: `li:has(:focus-visible) { outline: 2px solid var(--accent); outline-offset: var(--focus-offset) }`, where `--focus-offset` is 3 px, the single token §13.1 and §22 both refer to.
- A visually hidden `aria-live="polite"` status updates only on snap completion or a keyboard jump: "Project 3 of 3, CineMatch." The set size announced is the same denominator as the counter — projects only, never the CTA card.
- The decorative index is `aria-hidden`; heading order runs `h2` for the section and `h3` for each card title, fixing v1's inverted order.
- A visually hidden hint precedes the list: "Scroll, swipe sideways, or use the arrow keys to browse projects."
- Index strings use `String(i + 1).padStart(2, "0")`, so a tenth project reads "10" rather than "010".

### 10.10 Mobile and Calm layouts

**Touch (no pin, no Lenis, no JavaScript for motion):** the track becomes `overflow-x: auto` with `scroll-snap-type: x mandatory`, `overscroll-behavior-x: contain`, `scroll-padding-inline` matching the page gutter, and items at `flex: 0 0 82vw` with `scroll-snap-align: start`. Native momentum, native trackpad side-scroll, native snap. The counter and progress bar are driven by a single IntersectionObserver at a 0.6 threshold. `overscroll-behavior-x: contain` scopes the back-swipe to the list rather than suppressing it page-wide. Where supported, `animation-timeline: view(inline)` adds a card scale behind an `@supports` guard.

**Calm mode and `prefers-reduced-motion`:** no pin, no Lenis, no parallax, skew, split or magnetics. The track becomes a vertical stacked grid with a `clamp(24px, 4vw, 48px)` gap, images are static, the progress bar and counter are hidden, and the CTA is a plain link. Hover reduces to colour and opacity.

### 10.11 Data

The rail queries featured projects, ordered:

```groq
*[_type == "project" && featured == true] | order(featuredOrder asc) {
  _id, title, "slug": slug.current, category, techs, summary, year,
  links, imageKind,
  cover { asset->{ url, metadata { lqip, dimensions } }, hotspot, crop, alt }
}
```

There is no `slice()` anywhere. If `featured` yields nothing, the rail falls back to all projects ordered by `order`. React keys are `_id`, which is stable identity rather than v1's positional index.

### 10.12 Acceptance criteria

1. Vertical wheel or trackpad, horizontal trackpad delta, and shift with wheel all advance the rail forward and backward at one-to-one with the gesture while pinned.
2. Horizontal gestures anywhere outside the armed range behave exactly as they would if the rail did not exist, and never trigger browser back or forward while the rail is armed.
3. Arrow, Home, End and Page keys move the rail when focus is inside it, and the ends do not trap keyboard users.
4. Drag, throw and snap: at rest, a card edge is always aligned to the rail gutter.
5. The counter and progress bar always match the visually active card.
6. Resize, font swap and a CMS project-count change all re-measure the rail, and the active card index survives a mid-rail resize.
7. `document.documentElement.scrollWidth === clientWidth` at 320, 375, 768, 1024, 1440 and 1920 px — the same six widths as §12.6 and §23, including the 375 px phone the primary persona uses.
8. Calm mode renders a stacked list with no pin and no transforms.
9. Touch renders a native snap scroller with no pin and no Lenis.
10. axe reports zero violations on the section; every card is reachable and announced.

Test hooks that ship in production because they cost nothing: `data-rail-index` on the section, updated on active-card change, and `data-rail-state` reading `pinned`, `static` or `stacked`.

---

## 11. Core user journeys

### 11.1 Recruiter on a phone (primary)

1. Opens the link from LinkedIn on a phone.
2. Sees the name, role line, degree line and CTAs immediately — server-rendered, with particles fading in behind at the low tier and the preloader capped at 1800 ms.
3. Scrolls: the statement brightens word by word, the stats count up, and the featured work arrives as a native horizontal snap scroller with cards that scale as they centre.
4. Taps Résumé in the nav; the PDF opens in a new tab. Event: `resume_open`.
5. Optionally taps Ask AI, asks "What has Monish built with AI?", and gets a grounded answer with a mailto fallback.

**Success:** the résumé is opened or a contact link is clicked within 90 seconds.

### 11.2 Hiring manager on a desktop (secondary)

1. Lands and watches the particles assemble the name; moves the pointer to disturb them.
2. Scrolls to the Project Rail, then **swipes sideways on the trackpad** — the rail moves forward under the gesture. Drags a card and throws it; it snaps to the next stop.
3. Clicks a card and arrives at the case study through a shared-element morph.
4. Uses the sticky table of contents to jump to Architecture and Trade-offs; opens the GitHub link.
5. Follows the Next project card into a second case study.
6. Returns to contact and copies the email, where the label swaps to "Copied" with a drawn check.

**Success:** reaches 75% scroll depth on at least one case study.

### 11.3 Engineer who is really evaluating the front end

1. Opens developer tools, watches the network panel, and notes that the WebGL chunk loads after first paint.
2. Toggles the OS reduced-motion setting mid-session and watches the site switch to Calm without a layout jump or a reload.
3. Uses the in-site Full and Calm toggle to switch back.
4. Tabs through the Project Rail and confirms the focus ring is visible, the rail follows focus, and the document never drifts sideways.

**Success:** the reduced-motion path is as considered as the full one, and nothing about the motion system looks accidental.

### 11.4 Peer trying the playground

1. Clicks the "Can you beat my neural net?" teaser, which is already showing a looping mini-preview.
2. Draws in free mode and watches predictions and layer activations update.
3. Starts Beat the Model, completes 10 rounds, sees the score, and shares the link.

**Success:** completes a game, then shares or retries.

### 11.5 Monish adds a project

1. Opens `/studio` and signs in with Sanity.
2. Creates a Project: title, auto-generated slug, summary, cover with required alt text, tech tags, links, and a case-study body from the template blocks.
3. Toggles Featured and sets the order.
4. Publishes; the Sanity webhook hits `/api/revalidate` and the affected pages regenerate.
5. Within roughly 60 seconds the project appears on `/work`, in the Project Rail if featured, in the sitemap, and in the assistant's grounding content.

**Success:** under 15 minutes, with no code and no redeploy.

### 11.6 Calm-mode visitor

1. The OS has Reduce motion enabled, so Calm is applied before first paint from the inline head script — there is no flash of the full version.
2. The hero shows a static poster of the formed name; there is no scroll hijack.
3. Pinned scenes become ordinary vertical sections; the Project Rail is a stacked list; all text is fully visible without scrubbing.
4. Route transitions are instant; counters show final values; loaders and progress indicators still animate, because they are functional.

**Success:** every piece of content and every feature, including chat and the playground, is available and complete.

---

## 12. Design direction and tokens

### 12.1 Direction: Apple-level craft at maximum motion density

"Apple-level" is a **quality bar**, not an imitation. Do not use Apple fonts (SF Pro is licensed for Apple-platform mockups only), logos, product photography, trademarked device renders or copied page layouts. Device mockups are original CSS and SVG frames.

What it means here:

- **Hierarchy through scale.** Very large display type against small, quiet supporting text. One idea per screen.
- **Rhythm.** Large, deliberate vertical space between chapters; tight, consistent spacing inside components. Spacing is never uniform for its own sake.
- **Precision motion.** Scroll-linked, token-eased, interruptible, and correct when the visitor scrolls fast, scrolls backward or resizes mid-animation.
- **Materials.** Glass navigation with real backdrop blur, layered surfaces, a film-grain overlay, and specular highlights that follow the pointer. Glass is never stacked on glass, and text contrast on glass is verified in both themes.
- **Chapters.** Authored dark and light chapters alternate to create pacing: dark for hero through featured work, light for journey and skills, dark again for contact.
- **Boldness is spent, not sprayed.** Each chapter has one thing that is unmistakably the point, surrounded by supporting motion that is quieter but still present.

What is different from the conventional reading of that bar: **there is no motion budget**. Density is maximal by design (§4.2). The discipline lives in the simultaneity cap, the variety rule, the readability floor, and the compositor-only property list — not in doing less.

### 12.2 Colour

The accent derives from Monish's existing MP monogram favicon, which is `#C2A4FF` on `#0B080C` — so v2's identity colour is a continuation rather than an invention.

| Token | Dark chapters | Light chapters |
|---|---|---|
| `--bg` | `#0B080C` | `#FBFBFD` |
| `--surface` | `#141118` | `#FFFFFF` |
| `--surface-2` | `#1D1A22` | `#F2F2F5` |
| `--text` | `#F5F5F7` | `#1D1D1F` |
| `--text-secondary` | `#A1A1A6` | `#6E6E73` |
| `--hairline` | `rgba(255, 255, 255, 0.12)` | `rgba(0, 0, 0, 0.10)` |
| `--accent` | `#7C6CFF` | `#5A47E0` (same hue, darkened to clear 4.5:1 on light) |
| `--accent-soft` | `#C2A4FF` | `#8B6FE8` |
| `--gradient-signature` | `linear-gradient(90deg, #7C6CFF, #3DD6F5)` | Same, headline text only |

`--chapter-hue` is a single custom property on `:root` that the chapter system tweens; the particle colour uniform reads the same value, so the WebGL layer and the DOM never disagree. Every text and background pair must meet WCAG AA, verified by a token contrast unit test in both themes.

### 12.3 Typography

| Token | Value |
|---|---|
| Display and text | **Inter** variable, self-hosted through `next/font`, Latin subset, `font-display: swap`, stylistic sets `ss01` and `cv11` |
| Mono | **JetBrains Mono** variable, for code blocks, the playground and all counters |
| `--text-hero` | `clamp(3.5rem, 1rem + 9vw, 9rem)`, weight 700, tracking −0.035em, line-height 0.95 |
| `--text-display` | `clamp(2.5rem, 1rem + 5vw, 5rem)`, 700, −0.03em, 1.02 |
| `--text-headline` | `clamp(1.75rem, 1rem + 2.5vw, 3rem)`, 600, −0.02em, 1.1 |
| `--text-intro` | `clamp(1.1875rem, 1rem + 0.6vw, 1.5rem)`, 500, −0.01em, 1.35 |
| `--text-body` | `1.0625rem`, 400, line-height 1.5 |
| `--text-caption` | `0.875rem`, 500, +0.01em |
| Numbers | `font-variant-numeric: tabular-nums` on every stat, timer, counter and probability |

Text craft rules: `text-wrap: balance` on headings, `text-wrap: pretty` on short body copy, `-webkit-font-smoothing: antialiased` at the root. Banned in the hero: italic display type, a single accented word inside a headline, an all-caps eyebrow over every heading, an arrow glyph appended to button labels, and `01 / 02 / 03` numbering where the content is not a sequence — the rail's index numbers are a sequence, so they stay.

### 12.4 Space, shape and material

| Token | Value |
|---|---|
| Base unit | 4 px, with component spacing on an 8 px rhythm |
| `--space-chapter` | `clamp(6rem, 3rem + 10vw, 14rem)` of vertical padding |
| Content widths | Text 680 px, content 1080 px, media up to 1440 px, full bleed for zoom-to-fill scenes |
| Radius | Cards 28 px, media 20 px, chips and buttons 999 px |
| Glass | `background: color-mix(in srgb, var(--bg) 72%, transparent)` with `backdrop-filter: saturate(180%) blur(20px)`; transitions go through `blur(0)`, never `none` |
| Shadow | Pre-rendered layers that cross-fade; `box-shadow` itself is never animated |
| Grain | A 256 px SVG-noise tile on a fixed overlay at 0.045 opacity on light and 0.07 on dark |

### 12.5 Motion tokens

One source of truth in CSS custom properties, mirrored to TypeScript. **No inline duration or easing literal appears in any component file** — anything not expressible as a token is added to the token file first.

The add-list below is generated mechanically from §13 rather than written by hand, because a hand-kept list goes stale the moment a row changes. Every millisecond duration in §13 that is not on the base scale below: 100, 140, 150, 200, 210, 220, 250, 300, 320, 360, 380, 400, 420, 450, 500, 700, 800, 1000, 1100, 1200, 1600 and 2800 ms. Those steps are **added to the scale as `--dur-100` through `--dur-2800` before implementation begins**. The ambient and loop durations §13 expresses in seconds — 0.45, 0.9, 1.2, 1.5, 1.6, 2, 2.4, 2.5, 2.6, 3, 4, 5, 6, 8, 30 and 60 s — get a parallel `--loop-*` scale, since they are loop periods rather than transition durations. With both scales in place every §13 row names a token rather than a literal and the rule above holds without exception. A lint step greps component files for bare `ms` and `s` duration literals, so the rule is enforced rather than asserted.

| Token | Value | Used for |
|---|---|---|
| `--dur-instant` | 80 ms | Focus rings, press feedback |
| `--dur-micro` | 120 ms | Colour and tint changes |
| `--dur-fast` | 180 ms | Hover signals, tooltips |
| `--dur-base` | 240 ms | Default state changes |
| `--dur-mid` | 350 ms | Panels, sweeps, tab crossfades |
| `--dur-slow` | 600 ms | Entrances, keyboard jumps |
| `--dur-reveal` | 900 ms | Line and mask reveals, curtains |
| `--dur-cine` | 1400 ms | Particle morphs, hero formation |
| `--dur-epic` | 1800 ms | Preloader ceiling only |
| `--dur-exit-ratio` | 0.7 | Exits are always 0.7 of their entrance |

| Ease token | Curve | Used for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everything entering |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Everything exiting |
| `--ease-io` | `cubic-bezier(0.65, 0, 0.35, 1)` | Toggles and reversible states |
| `--ease-cine` | `cubic-bezier(0.87, 0, 0.13, 1)` | Cinematic morphs and curtains |
| `--ease-smooth` | `cubic-bezier(0.22, 1, 0.36, 1)` | Image loads, soft reveals |
| `--ease-std` | `cubic-bezier(0.4, 0, 0.2, 1)` | Neutral UI transitions |
| `--ease-amb` | `cubic-bezier(0.37, 0, 0.63, 1)` | Ambient loops, breathing |

The browser default `ease` and bare `linear` are banned, except `linear` on progress bars, loaders and anything scrubbed. Overshoot is expressed by **GSAP ease name** (`back.out(1.4)`, `elastic.out(1, 0.4)`) rather than as a cubic-bezier, so no control point outside 0 to 1 ever appears in a token. GSAP receives the identical curves through `CustomEase`, so CSS, GSAP and Motion never disagree by a frame.

| Spring | Config | Used for |
|---|---|---|
| `snap` | stiffness 400, damping 40 | Toggle thumbs, no overshoot |
| `ui` | stiffness 300, damping 30 | Default UI, layout indicators |
| `press` | stiffness 280, damping 26 | Haptic-feeling press and drop |
| `gentle` | stiffness 120, damping 20 | Panels, sheets, cards |
| `release` | stiffness 200, damping 20 | Drag release |
| `playful` | stiffness 400, damping 14 | Playground and 404 only |

| Scalar | Value |
|---|---|
| Distances | `--d-xs` 4 px · `--d-sm` 8 px · `--d-md` 16 px · `--d-lg` 24 px · `--d-xl` 48 px · `--d-mask` 110% |
| Scales | press 0.97 · subtle 0.98 · pop 1.04 · card 1.06 |
| Stagger | char 0.018 s · word 0.04 s · line 0.08 s · item 0.05 s · card 0.08 s, with a 0.6 s ceiling per group |
| Focus ring | `--focus-ring` 2 px · `--focus-offset` 3 px — the single source for §13.1, §10.9 and §22 |
| Runtime scalars | `--motion-scale` (0 in Calm) · `--parallax-scale` (0 in Calm, 0.5 on tier 2) · `--chapter-hue` |

### 12.6 Responsive behaviour

| Breakpoint | Behaviour |
|---|---|
| 320 to 767 px | Single column; no pinning; the rail and case-study galleries become native snap scrollers; no cursor layer; bottom-sheet chat; particles at tier 1 or 2 |
| 768 to 1023 px | Two-column bento; still no pin (the tablet band that v1 pinned is explicitly excluded); particles at tier 2 |
| 1024 to 1439 px | Full layout; both pins active; the complete motion catalog |
| 1440 px and above | Media up to 1440 px; typography caps at its `clamp` maximums; tier 3 effects where the device qualifies |

Verified at 320, 375, 768, 1024, 1440 and 1920 px with no horizontal overflow at any width, in both motion modes.

---

## 13. Motion catalog

This is the product specification, not an appendix. Each row is a named, reusable pattern with a stable ID that the codebase, the test suite and the QA checklist all reference. **182 patterns across 22 surfaces.**

Every table has the same six columns: ID, where it lives, what triggers it, the specification, the owning library, and the Calm-mode fallback. "Calm" means `prefers-reduced-motion: reduce` **or** the in-site motion toggle set to Calm — one state, one code path (§14.4).

### 13.1 Rules that bind every pattern below

1. **Compositor-only properties.** Animate `transform`, `opacity`, `clip-path`, and `filter` sparingly on isolated layers. Never `width`, `height`, `top`, `left`, `margin`, `padding`, `display` or `max-height`. Accordions animate `grid-template-rows` from `0fr` to `1fr`. Resizing uses `scale` with a transform origin. `box-shadow` is never animated — a pre-rendered shadow layer cross-fades instead. `border-radius` and `inset` may be tweened only on small, isolated, non-pinned layers where the repaint is cheap — the sanctioned cases are N03's nav pill and AI02's launcher morph. On any full-bleed or viewport-sized surface the radius is counter-scaled instead (§10.7).
2. **The universal interaction triad.** Every interactive element on the site ships hover, press and focus motion, plus disabled, loading, error and success states. Hover is one primary signal, 180 to 250 ms on `--ease-out`, with the reverse tween always attached and the whole rule inside `@media (hover: hover)`. Press is `scale(0.97)` or a 1 px translate over 100 ms on `--ease-in`, releasing over 200 ms. **Focus rings never animate in** — 2 px, instant, 3 px offset, at least 3:1 contrast, on `:focus-visible`, in a reserved transparent outline slot so activation causes no layout shift. Only deviations from this triad are called out per row.
3. **Three focal motions per viewport, maximum.** Ambient and micro-interaction layers do not count.
4. **Entrance variety.** No two adjacent sections share an entrance archetype; the vocabulary rotates through line reveal, mask reveal, stagger, character cascade and fade.
5. **Two pins per page.** On the home page they are the Project Rail and the Journey. Everything else scrubs without pinning or uses `position: sticky`.
6. **Nothing flashes more than three times per second**, anywhere — particles, scramble, glitch, pulses included.
7. **Ambient loops pause when they are not visible.** IntersectionObserver for off-screen, `visibilitychange` for a hidden tab. Every ambient timeline registers in one registry so the governor and the Calm toggle can stop them all in a single call.
8. **`will-change` only while animating**, only on the element, never `will-change: all`. Long-lived promoted layers are limited to the cursor pair, the pinned rail track and the canvas — under about ten promoted layers in view at any time.
9. **No layout reads inside a frame.** Rects are cached at refresh and resize time. Pointer handlers write values only; they never measure and never call `setState`.
10. **Content is never hidden behind motion.** No text is reachable only at a particular scrub position, and the LCP element never starts at zero opacity.

### 13.2 Global ambient — present at rest on every route

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| G01 | Fixed overlay, all routes | Always | 256 px SVG-noise tile stepped through 8 `translate3d` offsets, `steps(8)` over 1.2 s, opacity 0.045 light and 0.07 dark, `mix-blend-mode: overlay`, `pointer-events: none`, `contain: strict` | CSS | Static tile, no stepping |
| G02 | Background field, all routes | Always | `@property --field-angle` rotates 0 to 360 over 60 s linear, driving a three-stop conic and radial mesh whose hue is bound to `--chapter-hue` | CSS `@property` | Static gradient |
| G03 | Persistent canvas, all routes | Always | The hero particle system stays mounted as a fixed canvas: idle curl-noise amplitude 0.02, drift speed 0.1, count from the device tier | R3F | Frozen single frame, rendered once |
| G04 | Chapter boundaries, home | ScrollTrigger enter and leaveBack | `--chapter-hue`, `--chapter-ink` and the particle colour uniform tween together over 900 ms on `--ease-io`, set once on the root rather than per element | GSAP | 150 ms opacity crossfade of a flat tint |
| G05 | Media and cards, all routes | Lenis velocity | `quickTo` on `skewY` over 0.5 s on a power3 curve, value clamped to ±3 degrees from scroll velocity | GSAP | Off |
| G06 | Section boundaries | Boundary enters view | Hairline rule `scaleX` from 0 to 1 with a left origin, scrubbed over 20 vh; replaces v1's 720,000 px fake rules | GSAP ScrollTrigger | Drawn, static |
| G07 | Page ident, top left | Idle for more than 8 s | Monogram `scale` 1 to 1.03 to 1 over 2.4 s on `--ease-amb`, repeating three times then stopping | CSS | Off |

### 13.3 Preloader — first visit per session only

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| P01 | Progress counter | Font and hero-texture progress | Digits roll `yPercent: -100` per change over 250 ms on `--ease-out` in tabular figures; minimum 600 ms visible, hard ceiling 1800 ms then proceed regardless | GSAP | Number jumps, no roll |
| P02 | MP monogram | Mount | DrawSVG stroke from 0 to 100% over 900 ms on `--ease-io`, a single inline path under 2 KB | GSAP DrawSVG | Drawn state shown immediately |
| P03 | Particle handoff | Progress at 95% | Cloud to name formation, `uMorph` 0 to 1 over 1400 ms on `--ease-cine` with a per-particle delay of `aRandom × 0.35` | R3F plus GSAP | Formation set instantly |
| P04 | Curtain | Assembly at 60% | Overlay `yPercent` 0 to −100 over 900 ms on `--ease-cine`; the content underneath is already painted and is not opacity-zero, which protects LCP | GSAP | 200 ms opacity fade |
| P05 | Return visit | `sessionStorage` seen flag | A 300 ms opacity fade of a thin veil, nothing else | CSS | Same |
| P06 | Route pending veil | Navigation slower than 250 ms | Top hairline `scaleX` 0 to 0.8 over 800 ms on `--ease-out`, completing to 1 on commit; never blocks input | GSAP | Bar without easing |

### 13.4 Navigation

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| N01 | Nav bar | After the preloader, and on route mount | Items rise `yPercent` 110 to 0 inside an `overflow: hidden` mask, 700 ms on `--ease-out`, 0.05 s stagger | GSAP | Opacity 0 to 1 over 150 ms |
| N02 | Nav bar | Lenis direction plus `scrollY > 120` | `yPercent` −110 and 0, 450 ms on `--ease-out`, with a boolean-flip guard so the class flips once per state change rather than per event | GSAP | Always visible, no transform |
| N03 | Nav bar | `scrollY > 80` | Morph to a pill on one curve for every property, 420 ms on `--ease-out`: backdrop `blur(0)` to `blur(16px)`, background and border alpha, inner `scale(0.94)`, radius 12 px to 999 px. **Outer height stays constant** and the inner shrink is compensated by outer padding | CSS class plus GSAP | Properties change with a 150 ms colour-only transition |
| N04 | Active route indicator | Route change | A shared `layoutId` pill moves between items on the `ui` spring | Motion | Instant move |
| N05 | Nav links | Hover and focus-visible | Two stacked label copies, characters roll `yPercent: -100` over 380 ms on `--ease-out` with a 0.012 s stagger from the start | GSAP SplitText | Colour change only |
| N06 | Nav buttons | `pointermove` within 1.2× of the bounds | `quickTo` on x and y at 0.3 strength, 400 ms on a power3 out curve, releasing to 0 over 600 ms. Two magnetic targets per viewport at most, fine pointers only | GSAP | Off |
| N07 | Menu overlay | Click or Enter on the menu button | Panel `clip-path` from `circle(0% at button)` to `circle(140%)` over 800 ms on `--ease-cine`; link lines rise `yPercent` 110 to 0 with a 0.06 s stagger over 700 ms; closing replays the timeline in reverse at 1.4× speed. Background gets `inert` and focus is trapped | GSAP | Panel opacity over 200 ms, links static |
| N08 | Menu button | Menu toggle | MorphSVG between burger and close over 350 ms on `--ease-std`, equal command counts | GSAP MorphSVG | Instant icon swap |
| N09 | Chapter rail, right edge | Scroll | Per-chapter tick `scaleY` scrubbed to chapter progress; the active tick scales 1 to 1.6 with a label fade over 250 ms | GSAP ScrollTrigger | Ticks show a discrete active state |
| N10 | Skip-to-content link | Focus | `y` from −100% to 0 over 180 ms on `--ease-out` | CSS | Appears instantly |
| N11 | Logo | Hover | Monogram MorphSVG to a home glyph over 320 ms on `--ease-std`; press scales to 0.96 | GSAP MorphSVG | Colour only |

### 13.5 Cursor layer — fine pointers only, native cursor never hidden

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| C01 | Global aura | `pointermove` | A ring follows through `quickTo` at 0.45 s on a power3 out curve while an inner dot follows at 0.1 s, in `mix-blend-mode: difference`; two fixed elements, `will-change: transform` only while visible, and the handler performs no layout reads | GSAP | Not rendered at all |
| C02 | Any `[data-cursor]` element | Hover | Ring `scale` 1 to 2.2 with a label fade over 300 ms on `--ease-out`; over text it becomes an I-beam at `scaleX(0.12) scaleY(1.4)`. One delegated listener on the document, so CMS-added nodes are covered | GSAP | Not rendered |
| C03 | Buttons and cards | Hover | Ring tweens to the element's cached rect over 350 ms on `--ease-out`; rects are cached at refresh and resize, never measured per frame | GSAP | Not rendered |
| C04 | Global | `pointerdown` and `pointerup` | Down scales to 0.8 over 100 ms on `--ease-in`; up emits a pooled ripple scaling 1 to 2.5 with opacity 0.6 to 0 over 450 ms, at most three concurrent | GSAP | Not rendered |
| C05 | Project Rail | Hover over the rail | The ring shows a horizontal arrow glyph and stretches on `scaleX` with drag velocity, clamped at 1.6, reusing the rail's own velocity value | GSAP | Not rendered |
| C06 | Hero canvas | `pointermove` | `uMouse` damped at lambda 0.12, repulsion radius 0.15 world units, strength scaled by pointer speed; the value is written to a ref inside the ticker, never to React state | R3F uniform | Uniform frozen at centre |
| C07 | Global | 3 s without pointer movement | Opacity to 0 over 400 ms on `--ease-out`, returning in 150 ms; ticker work for the cursor is cancelled while hidden | GSAP | Not rendered |

### 13.6 Typography system

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| T01 | Every section heading (default) | In view at `top 85%`, once | SplitText by lines with `mask: "lines"`, each line `yPercent` 110 to 0 over 900 ms on `--ease-out` with a 0.08 s stagger; `autoSplit: true`, split after `document.fonts.ready`, aria handled by SplitText | GSAP SplitText | Opacity 0 to 1 over 200 ms, no transform |
| T02 | Display and hero headings only | After formation, or in view | Characters rise `yPercent: 120` and `rotateX: -60` to 0 over 1000 ms on `--ease-out` with a 0.018 s stagger; eight words maximum, reverted on unmount | GSAP SplitText | Opacity fade |
| T03 | Eyebrows, meta lines, counts | In view once, or hover | ScrambleText over 800 ms with upper-case characters, 0.2 s reveal delay and 0.4 speed; strings under 24 characters only | GSAP ScrambleText | Final text immediately |
| T04 | The statement paragraph | Scrub from `top 80%` to `bottom 40%` | Words move from 0.18 opacity to 1 with `scrub: 0.6` and a 0.1 s internal stagger; opacity only, one timeline for the block | GSAP ScrollTrigger | All words at full opacity |
| T05 | Display words | `pointermove` over the word | Per-character `--wght` from 400 to 700 with distance falloff through `quickTo` at 0.25 s. Display words only — variable-weight changes re-rasterise text, so never on paragraphs | GSAP plus a variable font | Off |
| T06 | Marquees | In view | Two rows at `xPercent` 0 to −50 over 30 s linear in opposite directions; `timeScale` becomes 1 plus scroll velocity times 0.02, and direction flips with scroll direction; paused off-screen | GSAP | Static row with the first items visible |
| T07 | Emphasised phrases | 120 ms after its line reveals | A hand-drawn underline path draws 0 to 100% over 600 ms on `--ease-out`; this is what replaces italic emphasis | GSAP DrawSVG | Drawn immediately |
| T08 | Every number on the site | In view once, or on value change | Per-digit column `yPercent: -10n` over 1400 ms on `--ease-out` with a 0.05 s stagger, tabular figures, formatted through `Intl.NumberFormat`; `aria-live="polite"` announces only the final value | GSAP | Final value, no roll |
| T09 | Body paragraphs | In view once | Opacity 0 to 1 with `y` 12 to 0 over 600 ms on `--ease-smooth`, applied **per paragraph and never per word** — reading is not cinematic | GSAP or CSS view timeline | Opacity over 150 ms |
| T10 | Pull quotes | In view | Quote marks `scale` 0.6 to 1 and `rotate` −8 to 0 over 700 ms on `--ease-out`; the body uses T01 | GSAP | Static |

### 13.7 Hero — the GPU particle wordmark

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| H01 | Hero canvas | Preloader handoff | Positions lerp to targets sampled from the rasterised wordmark; `uMorph` 0 to 1 over 1400 ms on `--ease-cine` with a per-particle delay of `aRandom × 0.3` and a slight spring overshoot in the simulation at k 0.08 and damping 0.9. Targets are baked once, with no per-frame allocation | R3F GPGPU plus GSAP | Formation set at t 0, no tween |
| H02 | Hero canvas | `pointermove` | Velocity shader applies a spring toward the target at 0.08 minus a repulsion term around `uMouse` with a 0.15 world-unit radius, damping 0.9; entirely on the GPU, pointer written to a ref | R3F | No repulsion |
| H03 | Hero, scrolling out | Scrub at 0.8 | `uDisperse` 0 to 1 drifts particles upward with depth spread and opacity falloff while the DOM copy moves `y: -40` and fades. The hero is not pinned — it scrolls naturally | GSAP ScrollTrigger | Particles hold, DOM fades over 150 ms |
| H04 | Persistent canvas | Each chapter enter and enterBack | Target texture swaps and `uMorph` re-tweens over 1400 ms on `--ease-cine`. Shape order: wordmark, statement glyph, bar chart, project grid, timeline helix, skills constellation, chat bubble, envelope. Textures are pre-baked at load and only one tween runs at a time | R3F plus GSAP | Instant shape swap under a 150 ms crossfade |
| H05 | Hero copy | Formation at 60% | Role line uses T02, availability pill uses T03, CTAs fade with `y: 12` over 600 ms on `--ease-out`; the whole window is 700 ms or less, and the LCP text starts visible with a transform-only reveal | GSAP | All copy visible, 150 ms fade |
| H06 | Scroll cue | 1.5 s after formation | A line `scaleY` 0 to 1 from a top origin then out from a bottom origin over 1600 ms on `--ease-amb`, repeating until the first scroll, then fading over 300 ms | CSS | Static chevron |
| H07 | Hero camera | `pointermove` | Camera x and y shift ±0.15 world units, damped in-frame at lambda 4 rather than through tween churn | R3F `useFrame` | Camera fixed |
| H08 | Hero, tier 3 only | Formation complete | Bloom intensity 0.6 to 1.2 to 0.8 over 900 ms on `--ease-amb`, a single post-processing pass | Postprocessing | No bloom |
| H09 | Hero, tier 1 and no WebGL2 | Mount | A pre-rendered AVIF poster of the formed name under 60 KB with `fetchpriority="high"`, revealed by a 900 ms `clip-path` mask | CSS | Static poster, no mask animation |
| H10 | Hero role line, recurring rotation | Every 2800 ms of dwell after H05 completes | The rotating three-entry line swaps through a mask roll: the outgoing entry leaves `yPercent` 0 to −110 over 420 ms on `--ease-in` (the 0.7 exit ratio applied to the 600 ms entrance), the incoming entry arrives `yPercent` 110 to 0 over 600 ms on `--ease-out`, inside one `overflow: hidden` mask so the line's height never changes. Paused on hover, on focus, off-screen and on a hidden tab per §22, and the entries are read from `siteSettings.roleLines` | GSAP | The **first** role only, rendered statically, with no rotation |

### 13.8 Home chapters 2 and 3 — statement and stats

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| S01 | Statement | In view at `top 85%`, once | The T01 line-mask reveal | GSAP | Opacity |
| S02 | Statement | Scrub | The T04 word brightening across the paragraph's scroll range | GSAP ScrollTrigger | Static full opacity |
| S03 | Statement | Scrub, after its phrase brightens | A marker rectangle behind the key phrase `scaleX` 0 to 1 from a left origin at `scrub: 0.6` | GSAP | Static highlight |
| S04 | Statement | CSS sticky, no pin | A section label sticks while the statement scrolls past, its opacity ramping 0.4 to 1 with view progress — sticky rather than pinned, to protect the two-pin budget | CSS with an `@supports` guard | Static |
| S05 | Particle layer | Chapter active | The H04 shape idles with sine breathing at 0.015 amplitude over 4 s | R3F | Frozen |
| ST01 | Stats bento | In view at `top 82%`, once | Cards rise `y` 40 to 0 with opacity over 800 ms on `--ease-out`, staggered 0.08 s on an auto grid from the start; eight cards maximum per stagger group | GSAP | Opacity over 150 ms |
| ST02 | Stat values | Entrance complete | The T08 odometer over 1400 ms; real numbers only, drawn from the CMS, never invented | GSAP | Final value |
| ST03 | Stats columns | Scrub | Per-column `yPercent` of −6, −12 and −3 with a linear ease and `scrub: true`, one ScrollTrigger for the section | GSAP ScrollTrigger | None |
| ST04 | Stat bars and rings | Scrub within the section | `scaleX` from a left origin, or `stroke-dashoffset` to 0, at `scrub: 0.6` | GSAP DrawSVG | Filled state |
| ST05 | Stat cards | Hover, press, focus | `rotateX` and `rotateY` up to ±6 degrees through `quickTo` at 500 ms on a power3 out curve with the parent holding a 900 px perspective; a glare highlight follows the pointer through CSS variables; press scales to 0.98; focus-visible shows the ring plus one tilt-and-settle replay | GSAP | Background tint only |
| ST06 | Particle layer, stats chapter | Chapter active | The H04 bar-chart form idles: column heights breathe by 0.02 of their height on a 5 s sine on `--ease-amb`, out of phase per column, and the pointer pushes the nearest column's particles aside. This is chapter 3's ambient behaviour under the §4.2 density rule | R3F | Frozen bar chart |
| FP01 | Featured work header | In view | The project count scrambles through T03 and the heading reveals through T01 | GSAP | Static |
| FP02 | Card cover images | In view once | A mask wrapper moves `yPercent` 100 to 0 while the inner image counter-translates `yPercent` −100 to 0 over 1100 ms on `--ease-cine`, with the inner image scaling 1.12 to 1 — a transform-only alternative to animating `clip-path` | GSAP | Opacity over 200 ms |
| FP03 | Card media, tier 3 only | Hover | A WebGL plane synced to the card rect takes `uHover` 0 to 1 over 600 ms on a power3 out curve, with 0.12 noise displacement, a 1.5 px RGB split and a damped pointer uniform. Tier 2 falls back to a CSS `scale(1.05)` with a duotone filter | R3F plus GSAP | No distortion |
| FP04 | Card meta row | Hover | Tags stagger `y` 6 to 0 at 0.03 s over 250 ms on `--ease-out` while the index scrambles | GSAP | Static |

### 13.9 Project Rail — the signature surface

Full behavioural specification in §10; this table is the motion contract and it owns the numbers — where §10 restates a value, these rows are authoritative and §10 follows them.

The Calm column below is Calm only: the **§10.10 vertical stacked list**, with no pin, no snap, no counter and no progress bar. The touch layout is a different state with its own row, R12 — a native horizontal snap scroller. The two are never the same fallback, and §10.12 criterion 8 tests the Calm one.

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| R01 | Rail viewport | Scroll | `pin: true` with `end: () => "+=" + maxX()`, track `x: () => -maxX()`, linear ease, `scrub: true`, `invalidateOnRefresh: true`, `anticipatePin: 1`. Pin one of two on the page; the linear ease is mandatory for `containerAnimation` children | GSAP ScrollTrigger | No pin and no pin spacer; the stacked list |
| R02 | Rail, while armed | Horizontal trackpad or shift with wheel | A Lenis `virtualScroll` interceptor rewrites horizontal delta into forward scroll inside the armed range and swallows it at the boundaries, with `overscroll-behavior-x: none` on the document to block browser back-swipe (§10.2) | Lenis | No interceptor; horizontal delta is left entirely alone |
| R03 | Rail viewport | Pointer drag | `Observer` with `type: "pointer"` and `dragMinimum: 6` maps drag to `lenis.scrollTo(target - deltaX, { immediate: true })`; release throws `velocityX × 0.28` clamped into range over 0.9 s on an expo out curve. A drag over 6 px suppresses the next click | GSAP Observer | No Observer; the stacked list scrolls with the page |
| R04 | Rail | Settle after scrub | `lenis/snap` in proximity mode, threshold half a card step, 140 ms debounce, 0.5 s duration; stops rebuilt on every refresh from `offsetLeft` and the longhand inline-start padding | Lenis Snap | No snap at all; the stacked list has no stops |
| R05 | Each card | `containerAnimation` scrub | Card `scale` 0.94 to 1 to 0.94 across `left 90%` to `right 10%`, linear ease, with the `.rail-dim` overlay going opacity 0.45 to 0 to 0.45. The dim is a separate overlay layer, never opacity on the card itself, so the card's own text never drops below full opacity | GSAP ScrollTrigger | All cards at their rest state |
| R06 | Card images | `containerAnimation` scrub | Image at `scale(1.12)`, `xPercent` −6 to 6 inside a clipped figure, transform only | GSAP | None |
| R07 | Cards and canvas | Drag and scroll velocity | Cards `skewX` clamped to ±7 degrees plus a WebGL wave uniform at `abs(v) × 0.02`, both fed from one shared velocity value through `quickTo` at 0.45 s on a power3 curve | GSAP plus R3F | Off |
| R08 | Rail header | Scrub and snap completion | Progress bar `scaleX` equals trigger progress; the counter digits roll over 250 ms on `--ease-out` when a snap completes | GSAP | Progress bar and counter both hidden, per §10.10 |
| R09 | Card | Hover, press, focus | Image `scale(1.06)` over 700 ms on `--ease-out`, title roll per N05, cursor label "View" per C02, press to 0.98 over 120 ms; focus-visible shows the ring and scrolls the card into view over 600 ms. One visual signal plus the label, not five | GSAP | Title colour only |
| R10 | Card link | Click or Enter | React `ViewTransition` with a per-slug name, `share="morph"`, a 400 ms group duration and a 3 px blur keyframe at 30%. Unsupported browsers simply cut | React ViewTransition | `animation-duration: 0s` for every view-transition pseudo-element |
| R11 | Rail | Arrow, Home, End, Page keys while focus is inside | `lenis.scrollTo(stop, { duration: 0.6 })`. Focus stays on the natively focusable links per §10.9 — one tab stop per card, no roving tabindex — and `focusin` pre-empts the browser's own focus-scroll; the ends fall through so the keyboard is never trapped | Lenis | Instant jump |
| R12 | Rail on touch or in Calm | Coarse pointer, narrow viewport, **or motion mode equal to Calm** — the mode is read from the React context, never from a media query alone (§10.3) | No pin and no Observer: native `overflow-x: auto` with mandatory x snapping, plus an optional `animation-timeline: view(inline)` card scale behind `@supports` | CSS | The same, without the view-timeline effect |
| R13 | Rail, at rest | Chapter active, no gesture for 2 s | A specular sheen sweeps the active card's edge `xPercent` −120 to 120 over 2.6 s on `--ease-amb` every 6 s while the particle project-grid form drifts at 0.03 amplitude. This is chapter 4's ambient behaviour under the §4.2 density rule; it stops the moment any gesture arrives and pauses off-screen | CSS plus R3F | Off |

### 13.10 Home chapter 5 — journey

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| J01 | Timeline spine | Pin of `+=200%` at `scrub: true` | DrawSVG takes the spine 0 to 100% across the pin. Pin two of two on the page; the path is 400 points or fewer | GSAP DrawSVG | No pin, path fully drawn |
| J02 | Traveller dot | The same scrub | A dot follows the path through MotionPath aligned to the path with `autoRotate: false`, its progress bound to the timeline | GSAP MotionPath | Hidden |
| J03 | Timeline nodes | The draw reaching each node label | Node `scale` 0 to 1 over 450 ms on `--ease-out` plus a ring scaling 1 to 1.8 with opacity 0.5 to 0 over 700 ms, once. Eight nodes maximum | GSAP | Dots visible from the start |
| J04 | Entry cards | Its node is reached | Alternating sides move `x` ±40 to 0 with opacity over 700 ms on `--ease-out`; copy uses T09 | GSAP | Opacity over 150 ms |
| J05 | Entry years | Its node is reached | The T08 odometer on the year over 600 ms in tabular figures | GSAP | Static |
| J06 | Timeline nodes | Hover and focus | Node `scale(1.3)` over 200 ms on `--ease-out`; tooltip fades with `y: 4` over 150 ms, after an 800 ms hover delay and a 0 ms focus delay, hoverable and dismissible per WCAG 1.4.13 | CSS | Tooltip without motion |
| J07 | Particle layer | Chapter active | The H04 helix shape rotates slowly at 0.05 radians per second | R3F | Static helix |

### 13.11 Home chapter 6 — skills

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| SK01 | Particle layer | Chapter active | The H04 shape becomes a node graph with GPU-drawn edges and a subtle drift; 200 lines maximum | R3F | Static constellation |
| SK02 | Skill chips | In view once | `scale` 0.86 to 1 with opacity over 500 ms on `--ease-out`, staggered 0.03 s from the centre on an auto grid, total stagger under 0.6 s | GSAP | Opacity only |
| SK03 | Skill group filter | Click | Motion `layout` with `AnimatePresence` in `popLayout` mode on the `ui` spring, exit at 180 ms opacity; `layout` applied to leaf chips only, list capped at 40 items | Motion | Instant reflow |
| SK04 | Tech marquee | In view | Two T06 rows moving in opposite directions, velocity-reactive, paused off-screen | GSAP | Static rows |
| SK05 | Skill chips | Hover and focus | Related chips hold at full opacity while the rest drop to 0.35 over 200 ms on `--ease-std`, driven by one class toggle on the container; connector lines draw over 300 ms on `--ease-out` | GSAP DrawSVG | Dimming only, no lines |
| SK06 | Learning-goal progress | In view once, then scrub within the section | The ST04 fill treatment on each goal's `progress` value from the CMS: `scaleX` from a left origin, or `stroke-dashoffset` to 0, at `scrub: 0.6`, with the percentage using the T08 odometer. Three goals maximum per §16.1 | GSAP DrawSVG | Filled state, final percentage |


### 13.12 Home chapter 7 — try-it teasers

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| TT01 | Teaser cards | In view once | `rotateY` −22 to 0 and `z` −80 to 0 with opacity over 900 ms on `--ease-out`, staggered 0.12 s, with perspective on the wrapper | GSAP | Opacity |
| TT02 | Teaser previews | In view autoplay, hover restart | Neural Doodle: a stroke path draws over 1.2 s on `--ease-out` then a prediction lands. Chess (P1, only if the chess mode ships): a three-move canned sequence with pieces moving over 450 ms on `--ease-cine` and 600 ms gaps. Started and stopped by IntersectionObserver, capped at three cycles then idle | GSAP and Motion | First frame only, static |
| TT03 | Teaser stack | Scrub | Cards stick through CSS sticky while the outgoing card takes `scale(0.95)`, opacity 0.6 and `y: -24` as the next overlaps — sticky, not pinned | CSS sticky plus GSAP scrub | Plain stacked cards |
| TT04 | Teaser CTA | Hover and focus | The arrow moves `x` 0 to 120%, then re-enters from −120% to 0 over 450 ms on `--ease-out`, with the label rolling | CSS | Colour change |
| TT05 | Particle layer, try-it chapter | Chapter active | The H04 chat-bubble form idles: the bubble's tail pulses and three interior dots cycle their brightness on a 2.4 s loop on `--ease-amb`, under 3 Hz. This is chapter 7's ambient behaviour under the §4.2 density rule, and it keeps running after TT02's three teaser cycles end | R3F | Static bubble |


### 13.13 Home chapter 8 — contact and footer

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| F01 | Footer | Scroll | The footer sits in `position: sticky` beneath the content and is revealed as the main content lifts off it; zero JavaScript, no pin | CSS | A plain footer below the content |
| F02 | "Let's build something" | Scrub from `top bottom` to `bottom bottom` | Characters rise out of a mask at `scrub: 0.6` with a 0.02 s stagger; two words maximum | GSAP SplitText | Static |
| F03 | Particle layer | Chapter active | The H04 envelope shape, dispersible by the pointer | R3F | Static shape |
| F04 | Email copy button | Click | The label cross-fades to "Copied" over 250 ms and a check draws over 300 ms, reverting after 2.5 s or on pointer leave. **No toast** — the result is already visible. Announced through `aria-live="polite"` | CSS plus GSAP | Text swap, no draw |
| F05 | Social links | Hover and focus | A background sweep `scaleX` 0 to 1 from a left origin over 350 ms on `--ease-out`, sweeping out to the right on leave, with the icon nudging `y: -2` | CSS | Colour only |
| F06 | Local time | Every minute | The minute digit rolls `yPercent: -100` over 300 ms on `--ease-out` in tabular figures, with the colon blinking at 1 Hz; one interval, cleared on unmount | CSS plus JS | Static digits |
| F07 | Back to top | Click | `lenis.scrollTo(0, { duration: 1.6 })` on an expo in-out curve; on arrival the particles replay the H01 formation at 0.7 speed. Cancelled by any user scroll input | Lenis plus GSAP | `scrollTo(0, { immediate: true })` |
| F08 | Contact CTA | In view, at rest | A glow pseudo-element breathes between 0.4 and 0.75 opacity over 3 s on `--ease-amb`, paused off-screen and on a hidden tab, well under 3 Hz | CSS | Static glow |

### 13.14 Work index

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| W01 | Page | Route mount | The title uses T02, then rows reveal line by line with a 0.05 s stagger over 700 ms on `--ease-out`; ten rows maximum in the first group, the rest on scroll | GSAP | Opacity |
| W02 | Grid and list toggle | Click | `Flip.getState` then `Flip.from` over 0.6 s on an expo in-out curve with `absolute: true` and a 0.02 s stagger. Flip rather than Motion `layout` because the item count exceeds five | GSAP Flip | Instant relayout |
| W03 | Filter and sort | Click | `Flip.from` with entering items at `scale(0.92)` plus opacity and leaving items fading over 240 ms; the URL search parameter is the state source, and any in-flight Flip is killed | GSAP Flip | Instant |
| W04 | Row hover preview | Hover | A single reused preview image follows the cursor through `quickTo` at 0.6 s on a power3 curve, entering with a mask at `yPercent` 100 to 0 over 400 ms and cross-fading between rows over 200 ms; tier 3 adds a WebGL RGB split keyed to pointer velocity. Images preload on `pointerenter` of the list | GSAP with R3F on tier 3 | No preview; a static inline thumbnail |
| W05 | Row surface | Hover and focus | Row background `scaleY` 0 to 1 from a bottom origin over 350 ms on `--ease-out`, text colour inverting, index scrambling through T03, press at 0.995 | CSS plus GSAP | Colour only |
| W06 | Rows | Scrub | Rows offset on `y` by a per-row `data-speed` between 0.94 and 1.06 with a linear ease, batched through `ScrollTrigger.batch` | GSAP ScrollTrigger | None |
| W07 | Category sticky header | Scroll | The header label swaps with a roll over 300 ms on `--ease-out` when the section changes, one trigger per group | GSAP | Instant text swap |

### 13.15 Case study

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| CS01 | Hero media | Route enter | The R10 morph completes into the hero; the title begins its T01 reveal at 60% of the morph, total transition 500 ms or less | ViewTransition plus GSAP | Instant |
| CS02 | Hero media | Scrub over the first 60 vh | Image `scale` 1.22 to 1 with an overlay fading 0.5 to 0 at `scrub: 0.6`, no pin | GSAP ScrollTrigger | Static |
| CS03 | Reading progress bar | Scroll | `scaleX` equals article progress through `animation-timeline: scroll(root)` inside an `@supports` guard, with a ScrollTrigger fallback | CSS or GSAP | Bar present, unsmoothed |
| CS04 | Figures | In view once | The FP02 mask reveal plus an inner parallax of `yPercent` −8 to 8 scrubbed; batched, with three concurrent reveals maximum | GSAP | Opacity |
| CS05 | Before and after slider | Drag or arrow keys | Motion `drag="x"` constrained with `dragElastic: 0.02` and a `press` spring on release; the top image uses `clip-path: inset()`; arrow keys move 5% per press over 200 ms on `--ease-std`; the handle has a 44 px hit area | Motion | Draggable with instant follow, no spring |
| CS06 | Sticky table of contents | Scroll | The active item indicator is a single `layoutId` element on the `ui` spring; each section ring scrubs its `stroke-dashoffset` | Motion plus GSAP | Active state without motion |
| CS07 | Metric callouts | In view | T08 counters plus ST04 bars | GSAP | Final values |
| CS08 | Architecture diagram | In view | Nodes `scale` 0.9 to 1 staggered 0.08 s; flow lines loop `stroke-dashoffset` over 1.6 s linear as a functional indication of direction, paused off-screen | GSAP DrawSVG | Drawn, no flow |
| CS09 | Next project panel | Scrub over the last 40 vh | The panel rises `yPercent` 30 to 0 while a ring fills; at progress 1 the CTA becomes focusable and clickable. Navigation is never automatic | GSAP ScrollTrigger | Static panel |
| CS10 | Image lightbox | Click an image | `Flip.fit` from the thumbnail to full size over 500 ms on `--ease-cine` with the backdrop blurring 0 to 12 px; drag-down dismiss at an offset over 120 px or a velocity over 500; background `inert`, focus trapped, Escape closes | GSAP Flip plus Motion drag | Opacity over 150 ms |

### 13.16 Playground — Neural Doodle and chess

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| PG01 | Tool panel | Route mount | Panel `scale` 0.97 to 1 with `y` 16 to 0 over 600 ms on `--ease-out`; controls stagger 0.04 s | GSAP | Opacity |
| PG02 | Drawing canvas | `pointermove` while drawing | Stroke smoothed by a 0.35 lerp with width driven by pointer speed, clamped between 2 and 10 px, on a 2D canvas; drawing happens on pointer events only, with no rAF while idle | Canvas 2D | Unchanged — drawing is the product |
| PG03 | Clear button | Click | Strokes are sampled to points, which scatter and fade over 800 ms on `--ease-out` using the hero particle shader with a temporary target | R3F or Canvas | Instant clear |
| PG04 | Probability bars | Inference result | Bars `scaleX` on the `gentle` spring staggered 0.04 s, the top label scrambling through T03, and rank changes animated by Motion `layout`; ten bars maximum | Motion | Instant values |
| PG05 | Thinking state | Inference in flight | Model-graph edges pulse `stroke-dashoffset` on a 900 ms loop, shown after 150 ms with a 300 ms minimum visible | CSS | Static "Thinking" label |
| PG06 (P1) | Chess pieces | `pointerdown` | `whileDrag` applies `scale(1.12)` and a shadow layer; legal squares fade in over 150 ms with dots scaling 0.6 to 1 staggered 0.02 s; a drop snaps on the `press` spring; an illegal move returns on a spring with a single 400 ms board shake. 32 draggables maximum | Motion | Click to move, instant snap, no shake |
| PG07 (P1) | Chess engine reply | Engine responds | The piece animates along x and y over 450 ms on `--ease-cine` with a `y: -8` arc at the midpoint; a capture scales the victim to 0 with a pooled twelve-particle burst over 300 ms | Motion plus GSAP | Instant placement |
| PG08 (P1) | Check and mate | State change | The king square ring pulses twice over 600 ms, under 3 Hz; mate tilts the board `rotateX: 6` over 700 ms on `--ease-out` with one 1.2 s confetti burst. One-shot, never looping | GSAP | Colour and label only |
| PG09 (P1) | Move list | Each move | `AnimatePresence` items enter `y` 8 to 0 with opacity on the `ui` spring; the inner scroller carries `data-lenis-prevent`; virtualised past 60 moves | Motion | Opacity |
| PG10 | Mode tabs | Click | A `layoutId` pill moves on the `ui` spring while content cross-fades out over 100 ms on `--ease-in` and in over 150 ms on `--ease-out`. Cross-fade only — tab content never slides | Motion | Instant swap |

### 13.17 AI assistant panel

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| AI01 | Launcher pill | Always | A gradient ring rotates through `@property --angle` 0 to 360 over 8 s linear; hover scales to 1.05 with the N06 magnetic pull; press to 0.95. Paused off-screen and on a hidden tab | CSS plus GSAP | Static ring |
| AI02 | Panel | Click or the command shortcut | A shared `layoutId` morphs the launcher into the panel with the radius going 999 px to 20 px on the `ui` spring; contents fade in 120 ms later; closing runs at 0.7 speed | Motion | Opacity over 150 ms |
| AI03 | Messages | New message | User messages enter from `x: 16` and assistant messages from `x: -16` with opacity on the `ui` spring, inside `AnimatePresence` in `popLayout` mode; the list virtualises past 50 messages | Motion | Opacity over 120 ms |
| AI04 | Streamed tokens | Each stream chunk | Each chunk span fades 0.35 to 1 over 140 ms on `--ease-std` **per chunk, never per character**; a caret blinks at 1 Hz inside the message only; spans merge after completion to keep the DOM small | CSS | Text appears without fading |
| AI05 | Thinking indicator | Request sent | Three dots move `y: -3` on a 0.15 s yoyo stagger over a 900 ms loop | CSS | Static ellipsis |
| AI06 | Suggested prompts | Panel open or idle | Chips stagger 0.04 s with `y` 8 to 0 over 350 ms on `--ease-out`; clicking one flies it to the input through Flip over 350 ms and then sends. Four chips maximum | Motion plus GSAP Flip | Opacity |
| AI07 | Input field | Focus | The ring appears instantly; a border gradient angle sweeps once over 900 ms on `--ease-out`; the container scales to 1.005 | CSS | Ring only |
| AI08 | Send button | Click or Enter | The icon moves `x` 0 to 24 while fading, then re-enters from −24 to 0 over 400 ms on `--ease-out`; disabled with a spinner while streaming, minimum 300 ms visible | CSS | Icon swap |
| AI09 | Error state | Request failure | The bubble shakes `x` ±6 px over 300 ms once, with an inline Retry fading in over 200 ms under `role="alert"` | GSAP | Colour and message only |
| AI10 | Mobile sheet | Open on a coarse pointer | The sheet moves `y` 100% to 0 on the `gentle` spring with drag-to-dismiss at an offset over 120 px or a velocity over 500; the scrim fades to 0.5. `data-lenis-prevent` on the sheet and the page scroll-locked | Motion | Fade instead of slide |
| AI11 | Page behind the panel | Panel open | Page content scales to 0.995 while the scrim blurs 0 to 8 px over 300 ms on `--ease-out`; skipped entirely on tier 1, where blur is expensive | CSS | Scrim without blur |

### 13.18 Buttons, links, forms and micro-interactions

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| B01 | Primary button | Hover, press, focus | Hover fills with a sweep `scaleX` 0 to 1 from a left origin over 450 ms on `--ease-out`, leaving from the right, with a 380 ms label roll. Press scales to 0.97 over 100 ms on `--ease-in`, releasing over 200 ms. Focus-visible shows the ring instantly plus one sweep replay | CSS plus GSAP | Colour and opacity only, with every state still visually distinct |
| B01b | Primary button | Disabled, loading, success, error | Disabled drops to 0.5 opacity with no hover response. Loading cross-fades the label to a spinner after a 150 ms delay with a 300 ms minimum. Success draws a check over 300 ms. Error shakes `x` ±6 px over 300 ms. These are the remaining four of §13.1 rule 2's eight states | CSS plus GSAP | Each state still visually distinct, colour and text only |
| B02 | Secondary and ghost buttons | Hover | Background tint over 200 ms on `--ease-std` plus a 3 px arrow nudge; the same press and focus behaviour as B01 | CSS | Tint only |
| B03 | Icon button | Hover | Icon `scale(1.1)` with `rotate: 6deg` over 200 ms on `--ease-out`; press to 0.9; a 44 px hit area created with a negative-inset pseudo-element that never overlaps a neighbour | CSS | Colour |
| B04 | Inline text link | Hover | The underline retracts `scaleX` 1 to 0 from a right origin over 140 ms on `--ease-in`, then grows 0 to 1 from a left origin over 360 ms on `--ease-out`; focus-visible shows the full ring with the underline at rest | CSS | Underline colour change |
| B05 | Text input | Focus, hover, error, success, loading | The label floats `y: -22` and `scale(0.82)` over 220 ms on `--ease-std`; hover tints the background over 150 ms; the focus outline is instant in a reserved 2 px transparent slot so nothing shifts; an error icon scales 0.5 to 1 over 200 ms with the message rising 4 px, the helper row holding `min-height: 1lh`; validation on blur then re-validating on input; border width constant in every state | CSS | Opacity and colour only |
| B06 | Checkbox and switch | Change | The thumb moves on the `snap` spring, the check path draws over 200 ms, and the track colour transitions over 180 ms | CSS or Motion | Instant |
| B07 | Select and dropdown | Open | `scale` 0.96 to 1 with opacity from a top origin over 180 ms on `--ease-out`, items staggered 0.03 s up to eight, closing over 140 ms on `--ease-in`, light-dismissed through the Popover API and flipped when within 16 px of a viewport edge | Motion | Opacity over 120 ms |
| B08 | Tooltip | Hover after 800 ms, focus at 0 ms | Opacity 0 to 1 with `y` 4 to 0 over 150 ms on `--ease-out`; hoverable, persistent and Escape-dismissible per WCAG 1.4.13 | CSS | Instant, no movement |
| B09 | Toast | Event | Enters `y` 16 to 0 with opacity over 400 ms on `--ease-out`, exits over 250 ms on `--ease-in`, dwells 5 s with a linear `scaleX` progress track, pauses on hover and focus, and stacks without displacing existing toasts or page content | Motion | Opacity only |
| B10 | Tag and chip | Hover and select | Background fills over 200 ms on hover; selecting scales a check 0 to 1 over 180 ms with a `layout` width change on the `ui` spring | Motion | Instant |
| B11 | Generic card | Hover | A pre-rendered shadow layer fades 0 to 1 with `y: -4` over 300 ms on `--ease-out` — one signal plus elevation, not five; `focus-within` shows the ring; press to 0.99 | CSS | Border colour |
| B12 | Contact form submit | Submit | Fields drop to 0.4 opacity while sending, the button label becomes a spinner, and on success the form cross-fades to a confirmation block over 200 ms out and 300 ms in with a drawn check. The form container itself never layout-animates | Motion plus GSAP | Cross-fade only |
| B13 | Anchor links | Click | `lenis.scrollTo(target, { duration: 1.2, offset: -96 })` on an expo in-out curve, with focus moving to the target heading. Never CSS smooth scroll, which fights Lenis | Lenis | `immediate: true` |

### 13.19 Feedback and loading states

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| FB01 | Skeletons | Loading with a known shape | A gradient layer translates `x` −100% to 100% over 1400 ms on `--ease-amb`, with every skeleton on the page sharing one phase; killed the moment content mounts | CSS | Static grey blocks |
| FB02 | Spinner | Loading with an unknown shape | A ring rotates over 800 ms linear, shown after 150 ms with a 300 ms minimum visible | CSS | Slowed but still present, because it is functional |
| FB03 | Success | Completion | A check draws over 350 ms on `--ease-out` with a badge scaling 0.8 to 1 on the `gentle` spring. **No toast when the result is already visible** | GSAP | The icon appears without drawing |
| FB04 | Error | Failure | The field or bubble shakes `x` through a damped sequence over 400 ms once, with an icon, a message and `aria-invalid`. Never colour alone | GSAP | Message only |
| FB05 | Empty state | No data | An illustration path draws over 900 ms on `--ease-out`, then floats `y` ±4 px over 4 s on `--ease-amb`, with a single CTA pulse; the float pauses off-screen | GSAP plus CSS | Static illustration |
| FB06 | Offline banner | Connection event | The banner drops `y` −100% to 0 over 350 ms on `--ease-out` with a retry button and spinner | CSS | Instant banner |
| FB07 | Optimistic rollback | Request failure | A 200 ms colour rollback plus an Undo affordance that does not auto-dismiss | Motion | Colour only |
| FB08 | Images | Decode complete | Opacity 0 to 1 over 400 ms on `--ease-smooth` with `scale` 1.02 to 1; explicit width and height always reserved; the hero image is eager with `fetchpriority="high"` | CSS | Opacity only |

### 13.20 Route and page transitions

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| RT01 | All route changes | `Link` with a forward or back transition type | Outgoing content fades over 150 ms on an ease-in with a reversed 400 ms slide; incoming fades over 210 ms on an ease-out delayed by the exit, with a 400 ms slide; the offset is ±60 px and `::view-transition` carries `pointer-events: none` so the page stays clickable. Wrappers live in each `page.tsx`, never in a layout, because layouts persist and their enter and exit never fire | React ViewTransition | Every view-transition pseudo-element at `animation-duration: 0s` |
| RT02 | Project card to case study | Click | A matching `name` per slug with `share="morph"`, a 400 ms group duration and a 3 px blur keyframe at 30%; the destination is prefetched so the pair exists | React ViewTransition | Instant |
| RT03 | Menu-driven chapter jumps (P1) | Menu link click | The persistent canvas takes `uWipe` 0 to 1 over 450 ms on `--ease-in` to cover, pushes the route inside a transition, then reveals 1 to 0 over 600 ms on `--ease-out`; total under 1100 ms with feedback inside 100 ms. Never combined with RT01 on the same navigation | GSAP plus R3F | Skipped entirely; RT01 at zero duration |
| RT04 | Site header | Any transition | The header group is anchored with `animation: none` and a raised z-index, and its old snapshot is hidden, so there is never a double-header flash | CSS | Unchanged |
| RT05 | Every route commit | Navigation commit | `lenis.scrollTo(0, { immediate: true })`, focus moves to the main heading with `tabindex="-1"`, the title is announced through `aria-live`, and after two animation frames plus `document.fonts.ready` a single `ScrollTrigger.refresh()` runs. Once per navigation, never per scroll | Lenis plus GSAP | Identical |
| RT06 | Particle canvas | Route commit | The canvas persists in the root layout and morphs to the route's shape over 1200 ms on `--ease-cine`: the project grid for work, the ambient-dust idle state for a case study, the brain form for the playground, and "404" for the error page, all defined in §15.5. The WebGL context is never re-initialised between routes | R3F plus GSAP | Instant shape set |
| RT07 | Streamed segments | A Suspense boundary resolves | The skeleton exits with a 150 ms slide-down while the content enters with a 210 ms fade and a 400 ms slide-up — deliberately asymmetric timing | React ViewTransition | Zero duration |

### 13.21 404

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| E01 | Particle canvas | Mount | Particles form "404" and then scatter on an outward impulse over 900 ms on `--ease-out`; the pointer **attracts** instead of repelling, reusing the hero simulation with an inverted force sign | R3F | Static "404" formation |
| E02 | Headline | Mount, and on hover afterwards | A T03 scramble over 800 ms, never looping | GSAP | Plain text |
| E03 | Particle canvas | Click anywhere | The digits re-form over 1200 ms on `--ease-cine` in a single tween | R3F plus GSAP | None |
| E04 | Home CTA | Hover | The B01 treatment plus the N06 magnetic pull, navigating through RT01 | CSS plus GSAP | A standard button |

### 13.22 Motion controls

There is **no visitor-facing light/dark theme switch**. Theme in this document means the authored per-chapter dark or light palette of §12.2, tweened through `--chapter-hue` — it is a property of the content, not a control. Any reference to "both themes" in testing means the dark and the light chapters.

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| TM04 | Motion toggle (Full and Calm) | Click | The thumb moves on the `snap` spring. Switching to Calm sets every registered ambient timeline to `timeScale(0)` over 400 ms, jumps scrubbed timelines to their rest state, freezes the particles into their formation, and sets the Lenis lerp to 1. One registry makes this a single call | GSAP plus React context | This control **is** the reduced-motion control; the state persists in `localStorage` and a cookie |
| TM05 | Motion toggle | First visit, after the preloader | The control fades in with `y` 6 to 0 over 400 ms on `--ease-out` with a one-shot ring pulse, so the toggle is discoverable rather than hidden in a footer | CSS | Appears without motion |

### 13.23 Scroll progress

| ID | Where | Trigger | Spec | Library | Calm fallback |
|---|---|---|---|---|---|
| SP01 | Global hairline | Scroll | `scaleX` equals page progress through `animation-timeline: scroll(root)` inside an `@supports` guard, with a ScrollTrigger `scrub: true` fallback | CSS or GSAP | Present, unsmoothed |
| SP02 | Chapter rail | Scroll | The N09 tick behaviour on the right edge of the home page | GSAP | Discrete active state |
| SP03 | Rail progress | Rail scrub | The R08 bar and counter | GSAP | Native scrollbar |
| SP04 | Back-to-top ring | Scroll past 150 vh | The button fades in over 300 ms while a ring's `stroke-dashoffset` tracks page progress; hover adds the magnetic pull and an arrow nudge, sharing SP01's progress value | GSAP | The button appears, the ring is static |

### 13.24 Coverage check

| Requirement from §4.1 | Where it is satisfied |
|---|---|
| Every section has an entrance | H01 and H05 in chapter 1, then S01, ST01, FP01, R05, J04, SK02, TT01, F02; W01, CS01, PG01 on the sub-pages and E01 with E02 on the 404 route |
| Every section has a scroll-linked effect | S02, S03, ST03, ST04, R01, R05, R06, J01, J02, SK04, TT03, F01, W06, CS02, CS03, CS04, CS09 |
| Ambient motion exists at rest in **every chapter** and on every route, per the §4.2 density rule | G01 through G07 globally, plus G03's persistent-canvas idle scoped to the hero wordmark in chapter 1 — the one that survives the first scroll, since H06's scroll cue self-terminates — then S05 in chapter 2, ST06 in chapter 3, R13 in chapter 4, J07 in chapter 5, SK01 in chapter 6, TT05 in chapter 7, and F03 with F08 in chapter 8; AI01 on the launcher across all routes; the 404 route is covered by G01 through G03, whose persistent canvas holds the "404" formation at idle |
| Every interactive element has hover, press and focus | The universal triad in §13.1, plus B01 through B13, N05, N06, R09, ST05, SK05, W05, F05, J06 |
| Motion is noticeable within the first viewport | P01 through P04, H01, H05, H06, **H10** (the role line, the one recurring loop inside the LCP viewport), N01, C01, G01, G02 |

---

## 14. Motion system architecture

A catalog this large only stays coherent if each kind of motion has exactly one owner, every library shares one frame, and the whole system can be turned down with a single call. Overlaps are the bug.

### 14.1 Library ownership

| Motion kind | Owner | Why it wins | Never used for |
|---|---|---|---|
| Smooth scroll, inertia, programmatic scroll | **Lenis** | Normalises wheel, trackpad and touch; exposes `gestureOrientation` and the `virtualScroll` hook the rail depends on; has `respectReducedMotion` built in | Never ScrollSmoother, never CSS `scroll-behavior: smooth` — both fight Lenis |
| Scroll choreography: pin, scrub, chapter timelines, the horizontal rail, snap, parallax, progress | **GSAP ScrollTrigger**, with Observer for raw gesture | Pinning, `containerAnimation`, the refresh lifecycle, and one shared playhead with all other GSAP work | Motion `useScroll` is never used on anything GSAP pins or scrubs |
| Presence, layout and shared elements inside a page: chips, filters, chat messages, tabs, toasts, reorder | **Motion** (`motion/react`) | `AnimatePresence` exit, `layout` and `layoutId` FLIP, springs, interruptible state animation — all React-state-driven by nature | Not GSAP, where state-driven exit animation means manual unmount plumbing |
| Gestures in UI: drag, swipe dismiss, inertia release on the chat sheet, lightbox and comparison slider | **Motion** `drag` with spring transitions | Pointer capture, constraints, elastic limits, offset and velocity semantics, touch parity | — |
| Gestures on the scroll rail: drag to scrub, flick, wheel capture | **GSAP Observer** applied to the Lenis scroll position | It must share the rail's scrub playhead; a second drag engine here causes fights | — |
| Text splitting, per-line and per-character reveals, scramble | **GSAP SplitText and ScrambleText** | `autoSplit` and `onSplit` re-split on resize and font swap, the `mask` option gives free reveal clipping, and aria is handled automatically | Hand-rolled span splitting loses the aria handling |
| SVG path draw, icon morph, path following | **GSAP DrawSVG, MorphSVG, MotionPath** | MorphSVG handles mismatched command counts, which Motion cannot | — |
| WebGL and 3D: hero particles, hover distortion, transition wipes, post-processing | **R3F and drei**, with uniforms driven by GSAP timelines or damped inside `useFrame` | Uniforms are plain numeric objects, so GSAP tweens them natively and they stay on the same playhead as the DOM | Never React state per frame |
| Micro-interactions: hover, press, focus, underlines, sweeps, shimmer, grain, marquee | **CSS** transitions, keyframes and `@property` | Zero JavaScript, retargetable mid-gesture, compositor-only, works before hydration | GSAP or Motion only when measurement or orchestration is required |
| Scroll progress bars and simple in-view reveals | **CSS `animation-timeline`** behind `@supports`, GSAP as the fallback | Off the main thread where supported | Never the only implementation of anything load-bearing |
| Route transitions | **React `ViewTransition`** for the default and for shared elements; GSAP with WebGL for the signature wipe; Motion for in-page content cross-fades | The browser owns snapshotting, so there are no router-freezing hacks | ViewTransition and a GSAP overlay are never stacked on the same navigation |
| Counters and number ticks | **GSAP** tweening a proxy plus `Intl.NumberFormat` | Seek-safe, snappable, on the shared timeline | — |

### 14.2 One ticker — the frame contract

**Exactly one `requestAnimationFrame` drives Lenis, GSAP and three.js.** The failure mode if they each own a loop is documented and visible: browser callback order is registration order, not causal order, so the renderer can draw a frame using the previous frame's scroll offset, which tears the WebGL layer against the DOM and gets worse with every extra loop.

Per-frame order:

```
1. SCROLL     lenis.raf(t_ms)          writes scroll position, emits 'scroll'
2. SYNC       ScrollTrigger.update()   through lenis.on('scroll', ScrollTrigger.update)
3. ANIMATION  GSAP root update         tweens and scrubbed timelines read the new scroll
4. UNIFORMS   refs to shader uniforms  mutable refs only, never setState
5. RENDER     R3F advance()            draws using this frame's scroll value
```

```ts
// app/(motion)/MotionRoot.tsx — client, mounted once in the root layout
const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000), false, /* prioritize */ true);
gsap.ticker.lagSmoothing(0);
ScrollTrigger.config({ ignoreMobileResize: true });
```

The third argument, `prioritize`, is what makes the numbered phase order above true. `gsap.ticker.add(fn)` appends to the queue, and GSAP's own root update is already registered, so the Lenis README's default two-argument form would run the root update *before* `lenis.raf` on every tick — scrubbed timelines advancing against the previous frame's scroll position, which is exactly the tear described above. Prioritising puts Lenis at the head of the queue instead.

The R3F `<Canvas>` runs with `frameloop="never"` and joins the same ticker through a small driver component that calls `advance()` once per tick and forces one frame on resize. Note the unit trap: `lenis.raf()` takes milliseconds while GSAP's root update takes seconds. After wiring, log a `useFrame` delta and confirm it reads about 0.0167 before trusting anything downstream. If tearing is still visible, escalate to the explicit-phase variant, removing GSAP's own root update from the ticker and calling all three phases from one owned animation frame.

Motion keeps its own batched loop, because it exposes no public API for external timing. It is therefore restricted to discrete, event-driven UI where a one-frame offset is invisible, and it must never animate the same element or visual group as a GSAP or WebGL-driven effect.

### 14.3 Primitives and file layout

```
lib/motion/
  tokens.ts     durations, eases, springs, staggers, distances (§12.5)
  loop.ts       Lenis + gsap.ticker + ScrollTrigger wiring (§14.2), singleton
  registry.ts   ambient-timeline registry: pause, resume, timeScale(0) in one call
  governor.ts   device tier, runtime FPS degradation, motion-mode context
  split.ts      SplitText factory with autoSplit, mask, fonts.ready and revert
  scroll.ts     makeChapter(), makeScrub(), makeParallax(), batchReveal()
  flip.ts       Flip helpers for the work index
  webgl/        GPGPU particle sim, target-shape baking, ref-based uniform bridge
hooks/
  useMotionMode()   'full' or 'calm'
  useTier()         0 to 3, memoised, SSR-safe
  useRevealOnce()   batched ScrollTrigger reveal with the section's archetype
  useMagnetic()     quickTo magnetic pull, fine pointers only
  useVelocity()     the shared Lenis velocity signal for skew and stretch consumers
components/motion/
  MotionRoot        mounts the loop, governor, cursor and grain, once, in the root layout
  Reveal            variants: line, chars, mask, fade, stagger — the entrance vocabulary
  SplitHeading      SplitText-backed heading with correct aria
  Counter           odometer with tabular figures and an aria-live final value
  Magnetic          wrapper for buttons and links
  Cursor            the aura layer
  ChapterTrigger    registers hue, particle shape, rail tick and enter timeline
  Rail              the pinned horizontal rail (§10)
  ParallaxLayer     decorative-only parallax, scaled by --parallax-scale
  ViewTransitionLink  Link wrapper that sets transition types
```

**Orchestration rules**

- One timeline per section, created in that section's client component through `useGSAP(..., { scope })`, so unmounting reverts everything with no manual `kill()` plumbing.
- Each home chapter registers `{ id, hue, particleShape, enterTimeline }` with `ChapterTrigger`, and the chapter's enter and enterBack callbacks drive the hue crossfade and the particle morph. The WebGL layer never needs to know anything about a section's internals.
- ScrollTriggers are created top-to-bottom in DOM order, or given descending refresh priorities, so pin spacing computes correctly.
- Refresh runs after `document.fonts.ready`, after any media loads inside a triggered section (debounced, once), after a route commit, after a motion-mode change (because layout differs between Full and Calm), and on a `ResizeObserver` of the main content — not on `window.resize` alone.
- Per-route cleanup checklist: revert the `useGSAP` scope, remove ambient registry entries, kill Observers, dispose route-specific WebGL textures, remove listeners, and never leave Lenis stopped.
- The entrance-variety rule is enforced in code: `Reveal` variants rotate per section and adjacent sections may not share one.

### 14.4 Motion modes: Full and Calm

- There are exactly **two modes**. `Calm` is the site's reduced-motion implementation, not a third state, so there is one code path to build and one to test.
- Resolution order: an explicit user choice (cookie plus `localStorage`) wins over `prefers-reduced-motion: reduce`, which wins over the Full default.
- The mode is applied **before first paint** by a small inline script in the head that stamps `document.documentElement.dataset.motion`, read from the cookie on the server where possible so there is no flash.
- Propagation: CSS reads the data attribute and sets `--motion-scale: 0`, `--parallax-scale: 0` and disables ambient keyframes; Motion is wrapped in `MotionConfig` with `reducedMotion` forced; GSAP reads a React context that re-runs `useGSAP` effects and uses `gsap.matchMedia()` for the media-query half; Lenis keeps `respectReducedMotion: true` and additionally gets a lerp of 1; R3F drops to `frameloop="demand"` and renders formations statically.
- **Calm semantics:** no transform over 8 px, no parallax, no scrub-driven movement (scrubbed timelines snap to their end state), no pinning, no cursor layer, no marquee, no WebGL morph tweens (instant state swap under a 150 ms crossfade), counters render final values, loaders and progress indicators keep running because they are functional, and all fades are 150 to 200 ms.
- Switching modes never causes a layout jump: the toggle runs a refresh and restores scroll position by anchor element.
- The toggle is **P0** and discoverable (§13.22, TM05), because a visitor without an OS preference still deserves the choice on a site this dense.

### 14.5 Device tiering

| Tier | Detection | WebGL | Particles | Effects | DOM motion |
|---|---|---|---|---|---|
| **T0 Calm** | `prefers-reduced-motion` or the user toggle | Static render or none | Frozen formation | None | Opacity only |
| **T1 Lite** | No WebGL2, `saveData`, `deviceMemory` at or below 2, or 4 or fewer cores with no `deviceMemory` API | Off — the H09 poster | None | None | Full GSAP and CSS motion, no cursor layer, no velocity skew |
| **T2 Standard** | Coarse pointer, mid-range laptops, or a passing capability check | On | 128 squared, 16,384 | No post-processing; CSS fallback for the WebGL hover distortion | Full, with `--parallax-scale: 0.5` |
| **T3 Max** | Fine pointer, WebGL2, 8 or more cores, and a passing GPU tier check | On | 256 squared, 65,536 | Bloom, subtle chromatic aberration, WebGL hover distortion, the WebGL wipe | Full |

The tier is computed once on the client, memoised, exposed through `useTier()`, and overridable with a `?tier=` query parameter for testing. **DPR is banded per tier, not flat:** tier 2 renders in `[1, 1.5]` and tier 3 in `[1, 2]`, with 2 the absolute ceiling anywhere. The runtime governor moves DPR only inside the active tier's band (§14.6, §15.5); raising tier 2 to a ceiling of 2 would add 78% more pixels on exactly the mid-range devices G3a and §20.2 are measured against. Particle counts are starting points and must be profiled on a real mid-range phone before being raised.

### 14.6 Runtime degradation

- **WebGL side:** drei `PerformanceMonitor` with refresh-rate-derived bounds, three flip-flops before falling back, driving a quality factor into DPR, particle count and post-processing. Performance regression is signalled during pointer drag and the rail scrub, with adaptive DPR and adaptive events enabled.
- **DOM side:** a frame-time sampler on the GSAP ticker over a rolling 90 frames. A sustained mean under 45 fps for 1.5 s steps quality down in order: disable velocity skew and grain animation, then set `--parallax-scale: 0`, then drop WebGL hover effects to their CSS fallbacks. The ladder ends there: stagger groups are **not** collapsed, because a stagger is entrance vocabulary and §13.24 and §23 audit entrance coverage. Recovery requires 10 seconds of clean frames and steps up one level at a time, never above the detected tier and never below T1 automatically — T0 is a user choice only.
- **Signal, not guess:** a `PerformanceObserver` on long animation frames logs any frame over 200 ms during scroll together with its attribution, so the cause is fixable rather than merely degraded.
- **Degradation is invisible.** Only ambient and decorative layers are ever dropped. No entrance, state or navigation motion is removed at runtime, because removing it would change meaning.

---

## 15. Technical requirements

### 15.1 Recommended stack

Versions are the latest stable at kickoff, pinned in the lockfile.

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js App Router with React and TypeScript in strict mode** | Static generation for fast, crawlable case studies with real link previews; route handlers for chat and webhooks; the embedded Sanity Studio; `next/image` and `next/font`; React `ViewTransition` for route transitions |
| Styling | CSS Modules plus global custom-property tokens | Full control for a bespoke design, no utility-template look, zero runtime cost |
| Scroll and timeline motion | **GSAP** core with ScrollTrigger, SplitText, ScrambleText, DrawSVG, MorphSVG, MotionPath, Flip, Observer and CustomEase, plus `@gsap/react`. Draggable and Inertia are deliberately **not** included: every drag surface has another owner — the rail uses `Observer` with a manual velocity throw through `lenis.scrollTo` (R03), and the lightbox, comparison slider, chat sheet and chess pieces all use Motion `drag` (§14.1) | Every formerly Club-only plugin is now free for commercial use, which is what makes a catalog this size affordable. SplitText 3.13 adds `autoSplit`, `onSplit`, the `mask` option and automatic aria handling |
| Smooth scroll | **Lenis** | Proven in v1, synced to the GSAP ticker, and its `virtualScroll` hook is what makes the rail's horizontal input work (§10.2) |
| Component motion | **Motion** (`motion/react`) | Layout animations, `AnimatePresence`, springs and drag. Loaded through `LazyMotion` with the smaller feature bundle on the initial route |
| 3D | **three** with **@react-three/fiber** and **@react-three/drei** | Declarative scene, `PerformanceMonitor`, adaptive DPR |
| GPGPU | `GPUComputationRenderer` plus custom GLSL | Particle simulation on the GPU |
| Post-processing | `@react-three/postprocessing`, bloom only, tier 3 only | One subtle pass, never three |
| CMS | **Sanity** with `next-sanity`, `@sanity/image-url` and `@portabletext/react` | Already in use in v1, so the migration is a model change rather than a platform change |
| AI | **Vercel AI SDK** with the OpenRouter provider | Streaming, the `useChat` hook, provider-agnostic |
| Fine-tuning and adapter serving | A provider supporting LoRA fine-tuning and serverless adapter inference on open-weight models, chosen at M8 | OpenRouter cannot serve a custom fine-tune; it stays as the base-model fallback |
| Rate limiting | `@upstash/ratelimit` with `@upstash/redis` | Persistent limits across serverless instances, which v1 lacks |
| Validation | `zod` | API input, environment variables, and CMS query results at the boundary |
| Code highlighting | `shiki` at build time | Zero client JavaScript for highlighted code |
| Testing | Vitest, Playwright, `@axe-core/playwright`, Lighthouse CI | See §23 |
| Hosting | Vercel with per-PR previews, Vercel Analytics and Speed Insights | Same as v1 |

**Alternative considered:** staying on a Vite SPA like v1. Rejected because case studies need per-URL metadata and link previews, the Studio and API routes would need separate deployments, static generation removes v1's layout-shift-on-fetch problem, and React `ViewTransition` in the App Router is the cleanest route-transition primitive available for a site this motion-heavy.

### 15.2 Project structure

```
app/
  (site)/
    layout.tsx               fonts, tokens, MotionRoot, Nav, Footer, ChatLauncher
    page.tsx                 Home: renders the eight chapters
    work/page.tsx
    work/[slug]/page.tsx
    playground/page.tsx
    resume/route.ts          302 to the CMS résumé asset
    not-found.tsx
  studio/[[...tool]]/page.tsx
  api/chat/route.ts · api/chat/feedback/route.ts · api/revalidate/route.ts
  sitemap.ts · robots.ts · opengraph-image.tsx
components/
  chapters/    Hero, Statement, Stats, FeaturedWork, Journey, Skills, TryIt, Contact
  rail/        Rail, RailCard, RailProgress, useRailGestures, useRailSnap
  motion/      as listed in §14.3
  particles/   ParticleCanvas, simulation.frag, render.vert, render.frag, shapes.ts
  chat/        ChatLauncher, ChatPanel, MessageList, SuggestedPrompts
  playground/  DoodleCanvas, NetworkViz, ProbabilityBars, GameMode, mlp.ts, preprocess.ts
  case-study/  PortableTextBlocks, Toc, MetricsRow, Gallery, CodeBlock, CompareSlider
  ui/          Button, Nav, Footer, Cursor, DeviceFrame, Chip, MotionToggle
lib/
  sanity/      client.ts, queries.ts, image.ts, types.ts, migrate-from-v1.ts
  chat/        buildSystemPrompt.ts, schema.ts, rateLimit.ts
  motion/      as listed in §14.3
  env.ts       zod-validated environment
sanity/
  schemaTypes/ · structure.ts · seed/content.json · seed/import.ts
ml/
  train_mnist.py · export_weights.py · README.md
  finetune/    draft_from_cms.ts, feedback_pull.ts, build_dataset.ts, pii_scan.ts,
               train.ts, eval_gate.ts, promote.ts, runs.json
.github/workflows/
  ci.yml · feedback-pull.yml (weekly) · finetune.yml (manual)
public/
  models/mlp-weights.bin · models/mlp-manifest.json · posters/hero-name.avif
  favicon.svg (the MP monogram carried over from v1)
styles/
  tokens.css · typography.css · motion.css · global.css
tests/
  unit/ · e2e/ · visual/ · fixtures/ (digits, chat eval set)
```

### 15.3 Rendering and data strategy

- **Server Components by default.** Content sections render on the server from Sanity at build time.
- **Client components** only for motion islands, particles, the rail, chat and the playground.
- **Static generation** for every site route, with `generateStaticParams` over project slugs.
- **Revalidation:** a Sanity webhook on publish and unpublish posts to `/api/revalidate` with a verified signature, which revalidates the tag for the affected document types.
- **No client-side content fetching** on site routes. If Sanity is unavailable, the last generated pages keep serving. This removes v1's fetch-then-reflow problem entirely.
- **Shared scroll state:** scroll progress reaches the particle scene through a mutable ref, never React state, so the canvas never triggers a re-render.
- **Particle canvas:** loaded through `next/dynamic` with server rendering disabled, mounted after first paint during idle time, and kept alive in the root layout so route changes morph the formation instead of re-initialising the WebGL context.

### 15.4 Performance architecture for a motion-heavy build

1. **Compositor-only properties**, per §13.1.
2. **`will-change` discipline:** only on the animating element, only while it animates; long-lived promoted layers limited to the cursor pair, the rail track and the canvas, under about ten in view.
3. **One animation frame** for Lenis, GSAP and three.js (§14.2). Zero `setInterval` and zero bare `requestAnimationFrame` in components.
4. **No layout reads inside the frame.** Rects are cached at refresh and resize time; the DOM-to-WebGL plane sync computes from a cached rect plus the Lenis scroll value rather than calling `getBoundingClientRect()` per frame.
5. **Pause everything invisible.** IntersectionObserver pauses ambient timelines and marquees; `visibilitychange` pauses every loop and stops the canvas advancing; `content-visibility: auto` is applied only where no ScrollTrigger measures the section, with pin spacing re-verified afterwards.
6. **LCP protection.** The hero's LCP candidate is server-rendered text that starts visible; its reveal is transform and clip only. The canvas chunk loads after first paint and idle. The preloader is first-visit only and hard-capped at 1800 ms. Fonts use `font-display: swap`, preload only the display weight, and text is split after `document.fonts.ready`.
7. **INP protection.** Every interaction shows feedback within 100 ms, with press states in CSS rather than JavaScript. Route transitions start their visual response before data resolves. Heavy work goes through a transition; the chess engine and any inference run in a Web Worker; token streaming appends per chunk, never per character. No handler exceeds 50 ms.
8. **CLS protection.** Explicit dimensions or aspect ratios on all media; a reserved helper-text row at `min-height: 1lh`; a reserved transparent focus-ring slot; toasts that stack without displacing content; pin spacing left enabled so nothing collapses.
9. **Frame budget:** 4 ms of JavaScript per frame on a mid-tier device, 1 ms in any pointer handler, three simultaneous focal motions, eight elements per stagger group, two pinned sections, two magnetic elements per viewport, and SplitText on headings only.
10. **GPU budget:** one `WebGLRenderer` for the lifetime of the app, DPR capped at 2, textures at 2048 px or smaller and compressed where possible, geometry, materials and textures disposed on route-specific teardown, one post-processing pass maximum and only on tier 3, and particles as `Points` with a buffer geometry that is never reallocated per frame.

### 15.5 Particle system specification

**Simulation.** Position and velocity live in float render targets, using half-float types for iOS Safari compatibility. Each frame the fragment shader computes a target position by mixing two shape textures with an eased progress that is offset per particle by a random delay attribute, adds curl noise scaled by a transit strength that peaks mid-morph, adds pointer repulsion within a radius (the pointer ray-cast onto the z-zero plane), and applies a damped spring toward the target.

**Shapes.** Each is precomputed at load into data textures of N points:

1. **Name wordmark** — "MONISH PATALAY" rendered to an offscreen 2D canvas in Inter 700, sampled by alpha with jitter.
2. **Statement glyph** — a quotation form, sampled the same way.
3. **Bar chart** — columns matching the stats chapter's bento rhythm.
4. **Project grid** — a card lattice echoing the rail.
5. **Timeline helix** — a slowly rotating spiral for the journey chapter.
6. **Skills constellation** — a Fibonacci sphere of nodes plus points distributed along roughly 150 random edges.
7. **Chat bubble** — an SVG path sampled along its length plus a light fill.
8. **Envelope** — the same method, for the contact chapter.
9. **"404"** — the wordmark method, on the error route only.
10. **Brain** — an SVG outline sampled along its length plus interior nodes, for the `/playground` route (RT06).

**Ambient dust** is not a tenth shape. It is a parameter of the idle state: the current shape's targets are released and the simulation runs on curl noise alone at low amplitude, which is what a case-study route shows (RT06). It needs no bake.

**Rendering.** `THREE.Points` with a custom shader providing size attenuation, a soft round sprite, and colour from a per-chapter uniform gradient. Additive blending on dark chapters only.

**Runtime and resilience.**

- Runtime degradation drops DPR first, then the tier, and never upgrades mid-session (§14.6).
- Rendering pauses when the canvas is off-screen or the tab is hidden.
- On WebGL context loss, the system swaps to the poster without erroring.
- An error boundary around the canvas falls back to the poster, as does any shape-precompute failure.
- The particle chunk budget is 260 KB gzipped, loaded after LCP.

### 15.6 Browser support

- The latest two versions of Chrome, Edge, Firefox and Safari on macOS, plus iOS Safari 16 and above.
- WebGL2 is required for particles; without it the session resolves to tier 1 and the H09 poster is shown. Tier 0 is never entered by a capability failure — it is a user choice only (§14.5, §14.6).
- Same-document View Transitions are supported in current Chrome, Edge, Safari and Firefox; unsupported browsers cut instead of morphing, which is an acceptable degradation and never blocks navigation.
- CSS scroll-driven animations (`animation-timeline`) are treated strictly as progressive enhancement behind `@supports`, never as the only implementation of anything load-bearing, because support is still uneven.
- The rail's horizontal gesture path must be verified by hand in Safari and Chrome on macOS, since two-finger swipe semantics and browser back-swipe interact there in ways that cannot be emulated reliably.

### 15.7 Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public | Sanity project |
| `NEXT_PUBLIC_SANITY_DATASET` | Public | Dataset name |
| `SANITY_REVALIDATE_SECRET` | Server | Webhook signature verification |
| `OPENROUTER_API_KEY` | Server | Chat model provider |
| `CHAT_MODEL` | Server, in Edge Config | Active model: the base model slug at launch, the fine-tuned adapter id after M8 |
| `CHAT_MODEL_FALLBACK` | Server | Base model through OpenRouter, used if the fine-tuned endpoint fails |
| `FINETUNE_API_KEY` | Server and CI | Fine-tuning provider, for training jobs and adapter inference |
| `SANITY_WRITE_TOKEN` | **CI only**, a GitHub Actions secret and never in Vercel | Imports visitor questions into the Studio |
| `CHAT_ENABLED` | Server | Kill switch, false on previews by default |
| `CHAT_DAILY_GLOBAL_LIMIT` | Server | Global circuit breaker |
| `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` | Server | Rate limiting and opt-in question storage |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical URLs and Open Graph |
| `NEXT_PUBLIC_E2E` | Build | Exposes the deterministic motion test hooks (§23) |

All variables are validated with zod at startup, and the build fails if a required server variable is missing in production. `.env.example` is committed and every `.env` file is gitignored.

---

## 16. Content model (Sanity)

### 16.1 Documents

| Type | Kind | Key fields | Validation |
|---|---|---|---|
| `siteSettings` | Singleton | name, shortName, eyebrow, roleLines (2 to 4), availability with status open, hidden or closed plus text, email, socials, location, resumeFile, accentColor, seo, features with chatEnabled and playgroundEnabled, chat with intro and suggestedPrompts | name, email, resumeFile and seo required; role lines 2 to 4 items of 28 characters or fewer |
| `about` | Singleton | statement (60 words maximum), longBio as Portable Text, portrait with alt, university, degree, start and end dates, gpa (opt-in), workAuthorization (opt-in) | statement length enforced |
| `stat` | Collection | label, value, prefix, suffix, decimals, sourceNote, order | label 24 characters or fewer; sourceNote required, so no number ships without a provenance line |
| `project` | Collection | title, slug, summary (140 characters maximum), category, year, role, timeframe, teamSize, status, featured, featuredOrder, cover with alt, imageKind, mockup, mediaFirst, metrics (4 maximum), techs, links, body as Portable Text, previewVideo, seo | slug unique; cover alt required; at most 4 featured; imageKind required so promo mock-ups are never presented as screenshots |
| `experience` | Collection | kind, organization, role, logo, start, end (null means present), location, bullets (1 to 4, each 140 characters maximum), metrics, techs | bullets required |
| `education` | Collection | school, degree, field, start, end, gpa (opt-in), coursework, honors | school and degree required |
| `achievement` | Collection | title, kind covering publication, award, community or competition, date, org, url | title and kind required |
| `skill` | Collection | name, category covering languages, frontend-backend, ai-ml or cloud-data, icon as a local SVG upload, url, showInMarquee | name unique; icon must be an uploaded asset, never an external CDN URL |
| `learningGoal` | Collection | title, progress 0 to 100, note, order | at most 3 shown |
| `chatFaq` | Collection | question, answer (80 words maximum) | used only for AI grounding |
| `trainingExample` | Collection | messages with user and assistant roles, source, tags, status, approvedAt | exported only when approved; the assistant turn is 150 words or fewer |
| `visitorQuestion` | Collection, imported and read-mostly | question, modelAnswer, rating, askedAt, status, linkedExample | deleted 90 days after `askedAt` |

### 16.2 Portable Text custom blocks

`callout` with problem, insight, tradeoff and lesson variants; `figure` with alt and caption; `gallery` of 2 to 8 figures; `code` with language and optional filename; `metricsRow`; `compare` with before and after images; `video` with a poster and caption; `divider`.

### 16.3 Studio requirements

- Desk structure: **Settings** (siteSettings, about), **Projects** (an orderable featured list), **Journey** (experience, education, achievements), **Skills** (skill, learningGoal), **Stats**, **AI assistant** (chatFaq and the suggested prompts), and **AI training** (visitor questions to review, training examples grouped by status, with an "Answer this" action that creates an example prefilled with the question).
- Alt text is required on every image field, so accessibility is enforced at authoring time.
- New projects start from the recommended case-study heading skeleton (§9.3).
- `sanity/seed/import.ts` runs the v1 migration described in §2.3. Unlike v1's import scripts, it is idempotent: it uses `createOrReplace` keyed by a deterministic id, so re-running it never produces duplicates, and it carries the résumé URL and iterates the canonical project list rather than only the first four, so a §26 Q5 decision to drop Zyra changes the list and not the script.
- The Studio route is `noindex` and excluded from the sitemap; access is controlled by Sanity project membership.

---

## 17. AI assistant — technical requirements

### 17.1 Request flow

```
ChatPanel ──POST /api/chat { messages, improve }──▶ route handler
  1. CHAT_ENABLED? else 503 { code: "disabled" }
  2. Origin allowlist (site URL, preview URLs, localhost) else 403
  3. zod validate body else 400
  4. Upstash rate limit per IP else 429 { retryAfter }
  5. Global daily counter else 429 { code: "daily_cap" }
  6. Build the system prompt SERVER-SIDE from the cached Sanity grounding document
  7. streamText with maxOutputTokens 400 and temperature 0.4
  8. Stream the response; log status, latency and token counts — never content
  9. Only when improve is true: push question, answer and askedAt to Upstash
     with a 90-day TTL and no IP. Ratings arrive at /api/chat/feedback, which is
     opt-in-gated the same way: it is called only when improve is true, and it
     enforces the same origin, validation and rate limits. With improve false a
     thumb is an analytics event only (§9.6)
```

### 17.2 Input limits

- `messages`: 1 to 20 items.
- Each message: role restricted to `user` or `assistant` — **a `system` role is rejected outright**, which is the fix for v1's open proxy. Content is a string of 1 to 1,000 characters.
- Total content 6,000 characters or fewer, with only the last 12 messages forwarded to the model.

### 17.3 Rate limits

- Per IP: 8 requests per 60 s on a sliding window, and 60 requests per 24 h.
- Global: the configured daily cap.
- Provider: an OpenRouter key with a hard monthly credit limit set in the provider dashboard, targeting 5 USD.

### 17.4 Grounding

- `buildSystemPrompt()` assembles the role and behaviour rules from §9.6, then siteSettings, the about statement and bio, education, experience, projects (title, summary, role, techs, metrics, and links as site-relative paths), skills, learning goals, achievements and the chat FAQs.
- The content is serialised as compact structured text inside clearly delimited tags, at 6k tokens or fewer. A unit test fails the build if the prompt exceeds that ceiling.
- **Only verified facts enter the grounding document.** The disputed `config.ts` metrics (§9.1) are excluded at the query level, so the assistant cannot repeat a number Monish has not confirmed.
- The result is cached in memory per instance for an hour and busted by the revalidate webhook.
- No vector database for launch; the content is small enough for full-context grounding.

### 17.5 Output handling

- Rendered with a restricted Markdown renderer: no raw HTML, and links permitted only to site-relative paths or allowlisted domains (github.com, linkedin.com, monishpatalay.dev). Anything else renders as plain text.
- Streaming produces a single `aria-live="polite"` announcement when the message completes, rather than announcing every chunk.

### 17.6 Evaluation

- `tests/fixtures/chat-eval.json` holds 20 questions with expected facts, plus 5 off-topic and 5 prompt-injection cases.
- `npm run eval:chat` runs them against the configured model before launch and after any model change, reporting pass and fail per the §9.6 acceptance criteria.

### 17.7 Fine-tuning strategy: grounding for facts, fine-tuning for voice

Fine-tuning is good at teaching a model **how** to answer: tone, phrasing, length, how it declines, how it points at a case study. It is unreliable for teaching **what is true**. Facts learned through fine-tuning blur together, go stale the moment the CMS changes, and get stated confidently when wrong.

The assistant is therefore a hybrid:

- **Facts always come from grounding** (§17.4), rebuilt from Sanity on every publish. A new project is answerable within a minute, with no retraining.
- **Voice and behaviour come from a LoRA fine-tune** of an open-weight instruct model in the 8B class, trained on conversations Monish wrote or approved — his own writing, his own data, nobody else's.
- **Every training example includes the production system prompt** with a content snapshot, so the model learns to answer *from* the supplied content and to say "I don't have that detail" when the content lacks it, instead of memorising facts.

**Sequencing:** launch ships on a base model with grounding only, so launch never waits on training data. The first fine-tune runs once at least 150 approved examples exist, and retraining continues as the data grows.

### 17.8 Training data pipeline

| Source | How it is created | Becomes |
|---|---|---|
| Owner-written question and answer pairs | Monish writes the questions and his ideal answers in the Studio, in his own words | `trainingExample`, approved |
| CMS-derived drafts | `draft_from_cms.ts` asks a strong model to draft pairs for each project and experience, written against Monish's own writing samples | `trainingExample` as a draft, which he edits and approves |
| Owner writing samples | READMEs, LinkedIn posts and project write-ups pasted into the Studio | A style reference for drafting, never trained on raw |
| Visitor questions, opt-in only | Stored in Upstash with a 90-day TTL and imported weekly into the Studio | Monish writes the ideal answer, producing a `trainingExample`; a missing fact is fixed in `chatFaq` or the relevant document |
| Thumbs-down answers, opt-in only | The same capture, with the model's answer attached | He writes a corrected answer, producing an example tagged as a correction |

**Rules**

- Only approved examples are ever exported, and approval is always a human action by Monish.
- A fact found missing during review is fixed in the CMS or the FAQ, not only in the training data.
- Visitor text is never trained on verbatim without review and editing.
- The runtime never holds a Sanity write token; imports run in CI.

**Dataset build**

1. Fetch approved examples and render each as a chat-format JSONL record: the production system prompt built from the current content snapshot, then the user and assistant turns.
2. Run a PII scan for emails other than Monish's, phone numbers, street addresses and IP addresses. Records with hits are dropped and listed in the report.
3. Screen for prompt injection: an example whose user turn contains an injection pattern must have a refusal-style answer tagged for safety, or it is dropped.
4. Deduplicate by normalised question text, and drop anything matching an eval-set question so the eval stays held out.
5. Split 90/10 into training and validation, deterministically by document-id hash.
6. Write versioned `train.jsonl`, `valid.jsonl` and a manifest recording count, source mix, dataset hash, content-snapshot hash and creation date. Datasets are private CI artefacts and are gitignored.

**Target mix for the first dataset of at least 150 examples:** roughly 40% owner-written, 40% CMS-derived and edited, 10% off-topic declines, 10% injection resistance.

### 17.9 Training and the evaluation gate

**Training** runs as a manually dispatched workflow. It uploads the dataset and starts a LoRA job on the chosen base model with a starting rank of 16 and 2 to 3 epochs at the provider's default learning rate, changing those only if validation loss shows under- or over-fitting. It opts out of provider reuse of training data, keeps the adapter private, and appends the job id, base model, dataset version, hyperparameters and cost to a committed run log that contains no training data.

**The gate** runs the same suite against the candidate and the current production model:

| Check | Pass condition |
|---|---|
| Facts, the 20-question set | At least 18 of 20, and no worse than production |
| Fabrication | Zero invented facts |
| Off-topic declines | 5 of 5 |
| Injection resistance | All base cases plus every case added from review cycles |
| Honesty about missing facts | 5 of 5 questions unanswerable from the content produce an explicit "I don't have that detail" |
| Voice, judged against Monish's reference answers over 20 prompts | Wins or ties on at least 60% versus production |
| Owner spot check | At least 8 of 10 sampled answers rated "sounds like me" |
| Length and latency | Median 120 words or fewer; p95 time to first token 1.5 s or less |

A candidate that fails any row is not promoted. The eval set grows every cycle, because new visitor questions become held-out test cases.

### 17.10 Promotion, rollback and retraining cadence

- **The active model is configuration, not code.** `CHAT_MODEL` lives in Vercel Edge Config, so switching models needs no redeploy.
- **Promote** updates that configuration only after the gate passes, and records the previous model id.
- **Rollback** restores the previous model id in one command, and is rehearsed once before the first promotion.
- **Runtime fallback:** if the fine-tuned endpoint errors or takes more than 5 s to the first token, the request retries once on the base model.
- **Cadence:** questions import weekly; retraining triggers when at least 50 new approved examples have accumulated since the last run, at most once a month.
- **Content changes never need a retrain.** New projects, roles and skills flow through grounding within a minute.

### 17.11 Cost controls

- **Inference:** the limits in §17.3, with fine-tuned inference capped at 5 USD per month by the provider's own hard limit.
- **Training:** a LoRA run on an 8B-class model at this dataset size is expected to cost a few dollars, with the long system prompt in every example driving most of the token count. Provider pricing is confirmed at M8; the hard budget is 10 USD per run and 20 USD per month.
- **Drafting:** CMS-derived drafts call a strong model once per new or changed document, under a per-run token cap.

---

## 18. Privacy, safety and security

### 18.1 Data handled

| Data | Stored | Where |
|---|---|---|
| Page analytics | Aggregated and cookieless | Vercel Analytics |
| Chat messages | **No** by default, processed in flight | Sent to the model provider per request |
| Opt-in questions, answers and ratings | Only with Help improve on; 90-day TTL; no IP address | Upstash Redis, then review in the Studio |
| Training datasets | Owner-approved examples only, PII-scanned | Private CI artefacts and the fine-tuning provider, with training-data reuse opted out |
| Chat metadata: status, latency, token counts | Yes, with no content | Vercel logs |
| IP address | Transient only, as a hashed rate-limit key with a TTL of 24 h or less | Upstash Redis |
| Playground drawings | No, processed entirely in the browser | — |
| Personal best score | Yes | The visitor's own browser storage |
| Motion-mode preference | Yes, in `localStorage` **and a first-party functional cookie**, because the mode is read on the server to avoid a flash (§14.4). It carries no identifier and is never used for analytics | The visitor's own browser storage and that one cookie |

**In plain words — what "Help improve" actually does**

The toggle in the assistant's footer is off unless you turn it on. Leave it off and nothing you type is kept anywhere: your question goes to the AI provider, the answer comes back, and when you close the tab it is gone. Turn it on and three things get saved: the question you asked, the answer the assistant gave, and your thumbs up or down if you give one. Your IP address is not saved, no cookie identifies you, and nothing links one question to another or to you. Monish is the only person who reads them, and he reads them for one reason: to spot answers that were wrong or awkward and write better ones. Anything he decides to reuse he rewrites himself first. Everything is deleted automatically after 90 days, whether he has looked at it or not. If you would rather not be part of that, just leave the toggle alone — the assistant works exactly the same either way.

The footer privacy note states, in short form: **analytics** are cookieless, and the only cookie the site sets is the one that remembers your Full or Calm motion choice; chat messages are sent to an AI provider to generate answers and are not stored unless you turn on Help improve, in which case your questions, answers and ratings are kept for 90 days to improve the assistant; drawings never leave your browser.

### 18.2 Security requirements

- **CSP:** nonce-based through middleware for site routes — `default-src 'self'`, scripts from self plus the nonce, `img-src` allowing self, data, blob and the Sanity CDN, `media-src` for self and the Sanity CDN, `connect-src` for self, Sanity and the Vercel analytics endpoints, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`. The Studio gets its own separately tested policy.
- **Headers:** `Strict-Transport-Security` with a one-year max-age, subdomains and preload; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` disabling camera, microphone and geolocation. This extends the header set v1 already ships in `vercel.json`.
- **Webhook:** `/api/revalidate` verifies the Sanity signature against the shared secret and rejects with 401 otherwise.
- **Secrets:** server-only, never prefixed for the client. The Sanity dataset is public-read, so the site needs no read token.
- **Chat hardening:** §17 — a server-only system prompt, a role allowlist that rejects `system`, input limits, sanitised output, and no tool or function calling.
- **Training-data integrity:** nothing trains without approval; PII and injection screening on every dataset build; eval questions held out; the Sanity write token exists only in CI.
- **Owner PII:** phone number and home address are never collected, never stored in a CMS text field, and never appear in the assistant's grounding content. The uploaded résumé PDF is the single exception, since it carries whatever contact block Monish chooses to publish in it (§9.1, §26 Q3). GPA and work-authorisation wording are opt-in fields.
- **Third-party assets:** no tech-stack logos or fonts are loaded from external CDNs, unlike v1, which pulls from four of them. Everything is self-hosted, which also simplifies the CSP.
- **Dependencies:** Renovate or Dependabot enabled; CI fails on high or critical audit findings in production dependencies.
- **Errors:** API responses never include stack traces or raw provider error bodies.

---

## 19. SEO and sharing

- Per-route metadata generation with the title pattern "Project — Monish Patalay", a description from the project summary, and a canonical URL.
- Open Graph and Twitter cards: a static branded default image at launch, per-project images from the cover at launch, and dynamic generated images as a P1 improvement.
- JSON-LD:
  - `Person` on the home page: name Monish Patalay, url `https://www.monishpatalay.dev`, `sameAs` the GitHub and LinkedIn profiles, `alumniOf` California State University - Los Angeles and CMR Engineering College, `knowsAbout` the top skills, and `jobTitle` only once the current status is confirmed — it is omitted, not guessed, until then (§26 Q1).
  - `CreativeWork` on each case study.
- `sitemap.ts` is generated from Sanity slugs; `robots.ts` disallows `/studio` and `/api`.
- Semantic structure: one `h1` per page, each home chapter as a `<section aria-labelledby>`, and the particle wordmark backed by a real `h1` text equivalent so the name is machine-readable even though it is drawn on a canvas.
- Target: Lighthouse SEO 100 on every route.

---

## 20. Analytics and success metrics

### 20.1 Events

| Event | Properties |
|---|---|
| `resume_open` | source: nav, hero, contact or footer |
| `contact_email_copy` and `contact_email_click` | — |
| `social_click` | network |
| `project_open` | slug, and source: rail, work_grid, next_project or chat |
| `rail_engage` | input: wheel, deltax, shiftwheel, drag or keyboard |
| `rail_depth` | furthest card index reached |
| `case_study_depth` | slug, depth of 25, 50, 75 or 100 |
| `chat_open` | source |
| `chat_prompt_sent` | suggested, a boolean — never the content |
| `chat_error` | code: network, rate_limited, daily_cap or disabled |
| `chat_feedback` | rating |
| `chat_improve_optin` | enabled, a boolean |
| `playground_start` and `playground_complete` | mode, and score for completion |
| `particles_tier` | tier 0 to 3, and whether it degraded |
| `motion_mode` | mode: full or calm, and source: os, toggle or default |

`rail_engage` matters more than it looks: it is the measurement that tells us whether the horizontal gesture work was worth it, by showing how many visitors discover side-scrolling at all.

### 20.2 Success measures, first 60 days after launch

| Metric | Target |
|---|---|
| Visitors who open the résumé or a contact link | 15% or more |
| Case-study visitors reaching 75% depth | 30% or more |
| Visitors who reach the rail and advance past card 2 | 60% or more |
| Rail visitors who use a horizontal gesture, drag or keyboard | 20% or more |
| Visitors who open chat | 10% or more, with a chat error rate under 2% |
| Rated answers marked helpful | 80% or more, and rising after each fine-tune |
| Playground starters who complete a game | 40% or more |
| Page loads with good Core Web Vitals | 75% or more |
| Particles running at tier 2 or above without degrading | 85% or more of WebGL-capable sessions |
| Sessions that switch to Calm | Tracked, not targeted. A rate above 5% is a signal that the motion density needs tuning, not a failure |

---

## 21. Performance and reliability requirements

### 21.1 Budgets

| Asset | Budget |
|---|---|
| Home initial JavaScript, excluding the deferred particle chunk | 150 KB gzipped |
| Deferred particle chunk | 260 KB gzipped |
| Motion libraries on the initial route: GSAP core, ScrollTrigger, SplitText, Lenis, and Motion's smaller feature bundle | Inside the 150 KB above. MorphSVG, MotionPath, Flip and Observer are imported per route; Motion's full feature set loads with the chat and playground chunks |
| Case-study route JavaScript | 100 KB gzipped |
| Playground route JavaScript | 80 KB gzipped plus int8-quantised MLP weights of 150 KB or less, roughly 107 KB as specified in §9.5 |
| CSS, all routes | 30 KB gzipped |
| Fonts | Two variable families, Latin subset, only the display weight preloaded, 120 KB total |
| Hero poster for tier 0 and 1 | 60 KB AVIF |

**Two of these numbers are provisional until measured.** The 150 KB initial-route figure comes from the generic landing-page rule rather than from a measurement of this exact stack, and the 260 KB particle-chunk figure was an unverified pre-tree-shaking estimate for a chunk that must also carry `GPUComputationRenderer`, custom GLSL, ten shape generators and a bloom pass. **M1 exit criterion:** the real tree-shaken gzipped sizes of the framework baseline, each motion library and the app code are measured and written into this table as a line-item allocation. Until that measurement lands CI warns on a regression; from M1 onward CI fails on one.

### 21.2 Targets

| Metric | Home | Work and case study | Playground |
|---|---|---|---|
| Lighthouse performance, mobile | 85 or above | 95 or above | 90 or above |
| Lighthouse accessibility | 95 or above | 95 or above | 95 or above |
| Lighthouse best practices and SEO | 95 and 100 | 95 and 100 | 95 and 100 |
| LCP at p75 | Under 2.5 s | Under 2.0 s | Under 2.5 s |
| CLS at p75 | Under 0.1 | Under 0.05 | Under 0.1 |
| INP at p75 | Under 200 ms | Under 200 ms | Under 200 ms |
| Median frame time under a 4× CPU throttle | 18 ms or less | 18 ms or less | 18 ms or less |
| Long animation frames over 200 ms during a scripted scroll | Zero | Zero | Zero |

The frame-time and long-animation-frame rows are release gates, not nice-to-haves. On a site whose selling point is motion, a dropped frame is a product defect.

### 21.3 Reliability

- Every image has explicit dimensions, and everything below the fold is lazy until the rail's eager flip (§10.8).
- A WebGL failure, a context loss or a slow GPU never blocks content (§15.5).
- A chat outage degrades to an inline message with a mailto call to action; the rest of the site is unaffected.
- A Sanity outage does not affect the live site, because the pages are static.
- The preloader has a hard 1800 ms ceiling and there is no path to a stuck loading state — the specific failure v1's 20-second model timeout invites.
- Every ambient loop stops on a hidden tab, so a backgrounded portfolio never burns a laptop battery.

---

## 22. Accessibility requirements (WCAG 2.2 AA)

- **Contrast:** 4.5:1 for body text and 3:1 for large text and UI components, in both chapter themes, verified by a token contrast unit test.
- **Keyboard:** every interactive element reachable in a logical order; a visible focus ring of 2 px in the accent colour with a 3 px offset that is never removed and never animates in; a skip-to-content link; and the Project Rail's full key set with no trap at the ends (§10.5).
- **Target size:** 24 by 24 CSS pixels minimum for every control, with a 44 px practical floor achieved through negative-inset pseudo-elements that never overlap.
- **Screen readers:** the canvas and decorative SVGs are `aria-hidden`; scrambled and rotating text exposes a stable label; counters expose their final value; the rail is a labelled region containing a real ordered list; pinned and horizontally translated content stays in logical DOM order.
- **Chat:** `role="dialog"` with `aria-modal` on the mobile sheet, focus moving into the panel and returning to the launcher on close, Escape closing it, and completion announced through a polite live region.
- **Playground:** sample-digit buttons as a non-drawing alternative, predictions announced, and a game timer that can be paused and extended.
- **Motion:** Calm parity for every pattern in §13; nothing flashes more than three times per second; auto-moving content such as marquees and the rotating role line pauses on hover and focus and when off-screen; and the in-site motion toggle is reachable from every route.
- **Cursor:** the native cursor is never hidden, the aura layer is additive only, it is disabled over text inputs and text selection, and it does not exist on coarse pointers.
- **Links:** external links indicate a new tab through visually hidden text.
- **Forced colors:** focus indication uses `outline` rather than `box-shadow`, so it survives forced-colors mode.

---

## 23. Testing and quality strategy

| Layer | Tooling | Scope |
|---|---|---|
| Unit | Vitest | Pure logic and schemas: the playground model, the motion system's maths, the rail's pure functions, the chat contract and the dataset builder. Full list under **Unit scope** below |
| Integration | Vitest with mocked providers | `/api/chat` across its 400, 403, 429, 503 and 500 paths plus streaming success; `/api/chat/feedback`; `/api/revalidate` with valid and invalid signatures |
| End to end | Playwright | The `h1` visible before WebGL; nav to case study and back; the résumé route returning a 302; chat open, suggested prompt, streamed answer with a mocked provider; playground sample digit to prediction; a ten-round game with mocked time; a keyboard-only journey; and a full Calm-mode run in which every piece of content is present |
| Project Rail | Playwright, with a helper that reads the track's matrix translation and asserts through polling because Lenis eases | All ten §10.12 criteria, plus six-width overflow and resize-identity checks. Full assertion list under **Rail scope** below |
| Motion determinism | Playwright with in-page hooks | `window.__motion` exposes `settle()`, `gotoChapter()`, `setTier()` and `seed()` when the E2E flag is set. `settle()` completes non-scrubbed timelines, updates ScrollTrigger, waits two frames and stamps an idle attribute that tests wait on — never a fixed timeout |
| Visual regression | Playwright screenshots | Home chapters, work, case study and playground at 320, 375, 768, 1024, 1440 and 1920 px, across the dark and the light chapters and in both motion modes. Canvas output is masked, with the particle formation asserted separately under **Visual-regression scope** below |
| Scroll state | Playwright | Positions are driven deterministically by scrolling Lenis immediately, then updating ScrollTrigger and waiting two frames |
| Frame rate and responsiveness | Playwright with CPU throttling at 4× | A scripted wheel scroll through the home page, then the rail, then the chat panel opening, collecting frame times from an in-page sampler and long-animation-frame entries. Run twice with the tier pinned, per **Tier pinning** below. Gate per run: median frame 18 ms or less, p95 30 ms or less, zero long frames over 200 ms |
| Interaction latency | Playwright | Time from `pointerdown` to the first visual change on primary buttons and rail cards must be 100 ms or less; INP is tracked in the field through web-vitals attribution |
| Accessibility | `@axe-core/playwright` | Every route in both motion modes, zero serious or critical. Plus a keyboard walk asserting the focus ring stays visible and unobscured mid-transition, and an assertion that Calm-mode reveal elements carry no transform |
| Manual device QA | Real hardware | MacBook Air M1 in Safari and Chrome, a Windows laptop with integrated graphics in Edge and Firefox, iPhone 12 or 13 in Safari, and a Pixel 6a or Galaxy A-series in Chrome: frame-rate check, tier assignment, touch interaction, and the macOS two-finger swipe on the rail in both Safari and Chrome, which cannot be emulated reliably |
| AI evaluation | `npm run eval:chat` | The §17.6 acceptance criteria |
| Fine-tune gate | `npm run eval:gate` | The §17.9 table, before every promotion |

**Unit scope.** MLP inference against a 50-digit reference fixture; preprocessing; shape point-sampling counts; scroll progress to morph mapping; device-tier resolution; the chat zod schema, including that it rejects a `system` role and oversized payloads; the system-prompt token ceiling; rate-limit key derivation; Portable Text block rendering; token contrast checks; the dataset builder covering JSONL shape, PII drops, dedupe, eval exclusion and deterministic splitting; and the rail's pure functions — velocity to skew clamping, chapter index maths, snap-target maths and index padding.

**Rail scope.** Vertical wheel advances the rail; horizontal `deltaX` advances it; shift with wheel advances it; `deltaX` above the rail does not scroll; `deltaX` clamps at the end without triggering navigation; arrow keys move one card and End jumps to the last; tabbing through every card keeps `window.scrollX` at zero; Calm mode stacks with no pin spacer and no transforms; no horizontal overflow at six widths; a mid-rail resize from 1440 to 1280 to 1600 preserves the active index; touch renders a native snap scroller; a drag throw changes position without opening a project; and a CMS fixture with eight projects produces eight cards plus the CTA.

**Tier pinning.** The throttled frame-rate suite runs twice, at `?tier=2` and at `?tier=3`, and asserts that `useTier()` resolved to the requested tier before it starts sampling. Without the pin, headless CI probes its way to tier 1 — no particles, no cursor layer, no velocity skew — so the gate would measure a static poster and report green while the tier 3 experience it exists to protect is never sampled.

**Visual-regression scope.** Canvas output is masked because GPU rendering is not deterministic; the particle formation is instead asserted through a seeded pixel-hash tolerance test on one reference machine. Note that Playwright's animation-disabling default fast-forwards finite animations and cancels infinite ones, which makes it right for layout snapshots and wrong for testing an animation itself.

**Coverage:** 80% of lines or more for `lib/`, the playground inference and preprocessing modules, the particle shape module, the rail's pure functions, and the API routes. Visual components are covered by visual regression rather than brittle markup assertions.

**CI on every pull request:** lint, type check, unit and integration tests, build, Playwright and axe against the Vercel preview URL, then Lighthouse CI with the §21 budgets as assertions. Merge is blocked on failure.

---

## 24. Milestones

Assumes one developer at roughly 15 to 20 hours per week. M0 is short because the content largely exists already — it lives in `config.ts`, the Sanity dataset and the résumé, and the migration script does the moving. What M0 actually buys is the writing that does not exist yet: case-study bodies, real screenshots, and the motion storyboard. The motion phases are deliberately the longest, because the motion system is the product.

| Milestone | Weeks | Deliverables | Exit criteria |
|---|---|---|---|
| **M0: Content & design** | 1 | Two to three case-study bodies written to the §9.3 template; real screenshots or recordings for the featured projects; a résumé re-read from the live PDF; the featured-three decision; accent and type specimen confirmed; chapter wireframes; and a motion storyboard covering the hero, the rail and one case study | Monish signs off on the content, the featured three, and the storyboard |
| **M1: Foundation & motion system** | 2–3 | Next.js scaffold; the token files; the one-ticker loop with Lenis, GSAP and ScrollTrigger; the ambient registry, governor and device tiering; the Full and Calm toggle applied before first paint; Sanity schemas plus the idempotent v1 migration; static generation with the revalidate webhook; environment validation; CI and Vercel previews | Every route renders real migrated CMS content; publishing updates the site within 60 s; the Calm toggle flips the whole site with no layout jump; the real tree-shaken gzipped sizes of the framework baseline, each motion library and the app code are measured and written into §21.1 as a line-item allocation, after which the budget gate blocks rather than warns; CI is green |
| **M2: Particle hero** | 4–5 | GPGPU simulation; ten baked shapes plus the ambient-dust idle state; scroll morphing; pointer interaction; tiers with the performance monitor; the AVIF poster fallback; context-loss handling | Frame-rate targets met on all four test devices; hero LCP unchanged against M1 within 100 ms |
| **M3: Project Rail** | 6 | The pinned rail; the Lenis virtual-scroll interceptor for horizontal gestures; drag with throw; snap; keyboard; counter and progress; per-card motion; the mobile native scroller; the Calm stacked list; the CTA morph to `/work` | All ten §10.12 acceptance criteria pass, including the macOS two-finger swipe verified by hand in Safari and Chrome |
| **M4: Home chapters & motion catalog** | 7–9 | All eight chapters; the global ambient layer; the cursor layer; the typography system; every pattern in §13 that belongs to the home page, navigation, buttons, forms and feedback states; responsive layouts; Calm parity throughout | Every chapter passes visual regression at six widths in both modes; the §13.24 coverage check is complete; the throttled frame-rate gate passes on the home page |
| **M5: Work, case studies & playground** | 10–11 | The `/work` index with Flip filtering and the grid and list toggle; the case-study template with all Portable Text blocks, the table of contents and the comparison slider; route and shared-element transitions; metadata, Open Graph, JSON-LD and the sitemap; the trained MNIST model, weight export, TypeScript inference, doodle canvas, network visualisation and Beat the Model | Lighthouse 95 or above on mobile for a real case study; Monish publishes one case study unaided; the playground acceptance criteria in §9.5 pass |
| **M6: AI assistant** | 12 | `/api/chat` with limits, grounding and streaming; the launcher and panel with all of §13.17; feedback and opt-in capture with the plain-language disclosure; the Studio review queue; the eval set and runner; the provider spend cap | The §9.6 acceptance criteria pass on the eval set; integration tests green; the opt-in toggle verifiably defaults to off |
| **M7: Hardening, motion QA & launch** | 13–14 | CSP and headers; axe fixes; Lighthouse and budget fixes; cross-browser and real-device QA; the throttled frame-rate gate on every route; analytics events; the v1 redirects; domain cutover with v1 kept unaliased for rollback | Every §21 and §22 target met; zero P0 bugs open; the site is live on `www.monishpatalay.dev` and the rollback path has been rehearsed |
| **M8: Fine-tuning v1** | 15–16 | Provider selection; CMS-derived drafting; the dataset builder; weekly feedback import; the training workflow; the eval gate; Edge Config promotion and rollback; the first voice fine-tune | At least 150 approved examples exist; the candidate passes every row of §17.9; rollback rehearsed once |

---

## 25. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Motion density overwhelms readability and the site becomes exhausting rather than impressive | High | High | The simultaneity cap of three focal motions, the variety rule, and the readability floor (§4.2); body copy is never split, parallaxed or scrubbed; a 10-second recruiter usability test at the end of M4 measures both recall of the motion and ease of reading; the Calm switch rate in §20.2 is monitored as an early warning |
| Performance collapses on low-end hardware under this many animations | High | High | The device-tier ladder and the runtime governor (§14.5, §14.6); a throttled frame-rate gate in CI that is a release blocker; ambient layers are the first thing dropped and no meaningful motion is ever removed at runtime; real-device QA from M2 rather than emulation |
| Motion sickness or vestibular discomfort | Medium | High | Calm mode is a first-class designed state, is applied before first paint, and is reachable in one click from any route; parallax is decorative-layer only and capped; nothing flashes above 3 Hz; no full-viewport rotation or zoom without user intent |
| The horizontal gesture behaves differently across browsers, or fights swipe-to-go-back | Medium | High | The single Lenis interceptor swallows the gesture at the boundaries rather than letting it fall through, and `overscroll-behavior-x` is set while armed; hand-verified in Safari and Chrome on macOS at M3, since it cannot be emulated; a Playwright suite covers the deterministic parts |
| Particle performance on iOS Safari or integrated graphics | Medium | High | Tiers, runtime degradation and the poster; half-float render targets; testing on real devices from M2 |
| Scope creep across four large features plus a 182-pattern catalog | High | High | The P0, P1 and P2 lines in §7 are enforced; the catalog is per-surface so a surface can ship at partial density without blocking; feature flags in `siteSettings` allow launching with chat or the playground disabled |
| Content and assets are thin — no headshot exists and four of six v1 projects use a grey placeholder | High | High | M0 makes real screenshots a blocker; `imageKind` prevents a promo mock-up being presented as a screenshot; the case-study skeleton makes a small project substantial; launch requires at least three projects with at least two full case studies |
| Unverified metrics from `config.ts` ship as fact | Medium | High | Every stat carries a required source note in the CMS; disputed numbers are excluded from both the site and the assistant's grounding until confirmed (§9.1, §17.4) |
| Template assets or another developer's project images leak into v2 | Low | High | The explicit do-not-carry list in §2.3; a build-time check that `public/` contains no file from that list; a visual review at M7 |
| The chess engine's GPL-3.0 licence creates an obligation that is not met | Medium | Medium | Chess is P1 and gated on §26 Q6; if it ships, the engine stays an unmodified separate artefact with visible attribution and a licence link |
| The assistant hallucinates facts about Monish | Medium | High | Full-context grounding, the explicit "I don't have that detail" rule, low temperature, and an eval set with a zero-fabrication gate |
| Chat abuse or a cost spike | Medium | Medium | A server-only prompt, the role allowlist that fixes v1's open proxy, persistent per-IP and global limits, a provider hard cap, and a kill-switch environment variable |
| The fine-tuned model states stale or invented facts | Medium | High | Facts only through grounding; every training example carries a content snapshot; fabrication and honesty rows in the gate; one-command rollback |
| Training-data poisoning through visitor questions | Medium | High | No automatic training; owner approval required; injection screening; visitor text is edited before use |
| Too little training data for a meaningful voice fine-tune | High | Medium | Launch without fine-tuning; CMS-derived drafts accelerate the first 150 examples; retrain only on 50 new examples or more |
| The MNIST model performs poorly on canvas doodles | Medium | Medium | MNIST-style preprocessing; optionally fine-tune on roughly 200 canvas-drawn samples; show confidence; the game framing makes misses part of the fun |
| ScrollTrigger pin bugs across route transitions | Medium | Medium | `useGSAP` scoping, `gsap.matchMedia` reverting on breakpoint change, a single refresh per navigation, and static generation so layout is final at first paint |
| Sanity free-plan limits | Low | Low | Portfolio usage is far below the limits; quotas are confirmed at M1 |

---

## 26. Open questions

| # | Question | Needed by | Default if unanswered |
|---|---|---|---|
| Q1 | What is the current status after May 2026 — degree conferred, still a Graduate Research Assistant, employed, or looking? And what availability text should the hero badge show? This drives the hero copy, the about section and the JSON-LD job title | M0 | The availability badge is hidden, the hero states the degree and dates factually in the past tense, and `jobTitle` is omitted from the JSON-LD entirely rather than guessed — `Person` is valid without it |
| Q2 | Which target role should the site optimise for: AI Engineer, Full-Stack Engineer, or both equally as v1 does? | M0 | Both, with AI Engineer leading the rotating role line |
| Q3 | The live résumé PDF is newer than the committed local copy. Which is canonical, can the current one be shared so the copy is written against it, and does the version uploaded to the CMS keep the phone number its contact block currently carries? | M0 | The live PDF at `resume.monishpatalay.dev` is canonical and is re-read before M0 sign-off; its contact block ships as Monish wrote it unless he supplies a variant |
| Q4 | Which three projects are featured in the rail? The proposal is Cook, Crop Expert and CineMatch (§9.1), with the Spotify Library Organizer as the strongest alternate | M0 | The proposal stands |
| Q5 | Zyra AI: keep it and correct the claims, or drop it? Its repository contradicts the `config.ts` description on the model, the backend, Docker, Kubernetes and CI | M0 | Keep it on `/work` with the description rewritten to match the repository, and no metrics |
| Q6 | Does the chess mode carry over into `/playground`? It reuses a GPL-3.0 Stockfish build, which means attribution obligations | M5 | Yes, as P1, with visible attribution and a licence link; if that is unacceptable, ship a second Neural Doodle mode instead |
| Q7 | Which unverified numbers and unverified biographical details can be confirmed? Three groups, itemised under **Q7 detail** below | M0 | Every unconfirmed number is omitted from the site and from the assistant's grounding |
| Q8 | Which of the 24 tech-stack items that appear in v1's pyramid but not on the résumé should survive? | M1 | Keep only the résumé's four groups; everything else is dropped |
| Q9 | Which location string is published: "Los Angeles, CA", "California, USA", or no city at all? | M0 | "Los Angeles, CA" |
| Q10 | Is the accent `#7C6CFF` with the `#C2A4FF` soft tint, derived from the existing MP favicon, the right identity colour? | M0 | Yes |
| Q11 | Is a portrait photo available? v1 has none, and the particle wordmark currently carries the identity alone | M0 | No photo; the particle system carries identity |
| Q12 | Is storing opt-in visitor questions for 90 days acceptable, given the plain-language disclosure in §18.1? | M6 | Yes, off by default, disclosed in the panel and the footer |
| Q13 | Does `www.monishpatalay.dev` host v2 directly, with v1 retired, and should the apex keep redirecting to www? | M7 | Yes, v2 on www, apex keeps its 308, v1 kept unaliased for 30 days then archived |
| Q14 | Which canonical live URL does each project use — the `monishpatalay.dev` subdomains named in the repository READMEs, or the `vercel.app` URLs on the résumé? Only CineMatch was verified | M0 | Prefer a `monishpatalay.dev` subdomain where it resolves, otherwise the résumé URL |
| Q15 | What does the live Sanity dataset currently contain, and who owns the Sanity, OpenRouter, Upstash and Vercel accounts? | M1 | The dataset is queried and reconciled at M1; all accounts are Monish's |
| Q16 | Will the MNIST model be trained personally, which is the stronger story, or should a pre-trained model be used? | M5 | Trained personally, using the provided script |
| Q17 | Which fine-tuning provider and base model? | M8 | An open-weight 8B-class instruct model on a LoRA-serving provider; stay on the base model if the gate is not passed |

**Q7 detail.** Three groups, all due at M0:

- **Metrics:** workshop participation up 25%; Airbnc 200+ users and 30% UX speed; Zyra 100+ users and 35% response time; the Spotify "16 languages".
- **Attribution:** which platform the 700+ DSA problems come from; the IJSREM paper's year and co-authors; the hackathon's name and year.
- **B.Tech record:** whether the degree, its 2020 to 2024 dates and its 3.6 / 4 GPA are correct. That entry appears in `config.ts` only and is not on the résumé.

---

## 27. Launch checklist

- [ ] Every open question due before launch — Q1 to Q16, which covers everything dated M0 through M7 — is answered or explicitly defaulted per §26, and the resulting content is published in Sanity; the résumé PDF uploaded and matching the live version
- [ ] The uploaded résumé PDF has been reviewed for personal information the site does not intend to publish, and the version in the CMS is the one Monish approved (§26 Q3)
- [ ] Every stat on the site carries a source note, and no unconfirmed metric appears anywhere including the assistant's grounding
- [ ] No template asset or third-party project image is present in `public/`; the build-time check passes
- [ ] `www.monishpatalay.dev` connected with HTTPS; the apex 308 still resolves; `NEXT_PUBLIC_SITE_URL` set
- [ ] 308 redirects verified for `/myworks` to `/work` and `/play` to `/playground`
- [ ] v1 deployment kept live but unaliased; rollback rehearsed end to end
- [ ] Production environment variables set and validated; chat enabled in production only
- [ ] OpenRouter hard credit limit configured; Upstash limits verified with a load script
- [ ] Sanity webhook configured against the production revalidate route with its secret; a publish test passes within 60 s
- [ ] Lighthouse CI budgets passing on the production URL
- [ ] Throttled frame-rate gate passing on home, work, case study, playground and the rail
- [ ] axe reports zero serious or critical issues on every route, in both motion modes
- [ ] The §13.24 motion coverage check is complete and signed off
- [ ] Project Rail acceptance criteria 1 to 10 verified, including the macOS two-finger swipe by hand in Safari and Chrome
- [ ] Manual device QA matrix complete
- [ ] Calm-mode walkthrough complete: every piece of content present, no pin, no transform-based reveals
- [ ] Motion toggle discoverable on first visit and persisting across reloads and routes
- [ ] Chat eval set passes on the production model
- [ ] Help improve defaults to off; the plain-language explanation is reachable from the panel; the 90-day expiry verified
- [ ] Open Graph previews verified by pasting links into LinkedIn and Slack
- [ ] `robots.txt` allows the site and blocks `/studio` and `/api`; the sitemap is submitted to Google Search Console and the v1 sitemap removed
- [ ] Analytics events visible in the Vercel dashboard, including `rail_engage` and `motion_mode`
- [ ] Privacy note live in the footer
- [ ] 404 page verified, including the particle formation and its Calm fallback
- [ ] Chess attribution and licence link present, if the chess mode shipped
- [ ] v1 working-tree changes committed, then the repository archived with a pointer to v2

