# Portfolio QA inventory

Recon completed before tests were written. Runtime content is fetched from Sanity; fallback URLs are separately audited, not assumed to be the live CMS content.

## Stack

Next.js App Router, React, TypeScript, Sanity, GSAP/ScrollTrigger/Flip, Lenis, Motion, R3F/Three/GPUComputationRenderer; local inference worker for Neural Doodle. Decorative particles exist. There is no first-person level, pointer lock, WASD, Rapier, rooms, collisions, planting interaction, or audio system. Those requested tests are not applicable.

## Routes and destinations

| Route | Links and behavior |
|---|---|
| `/` | Chapters `#hero`, `#statement`, `#numbers`, `#work`, `#journey`, `#skills`, `#try-it`, `#contact`; skip link `#main`; featured case studies; all work; playground; contact |
| `/work` | All projects; query filters `all`, `ai-ml`, `full-stack`, `computer-vision`, `web`; each case study |
| `/work/[slug]` | Back to Work; source/live external links; section TOC; next project; optional CMS rich content |
| `/playground` | Local inference, drawing, samples, timed game |
| `/studio/[[...tool]]` | Sanity editor/login; portfolio shell excluded; noindex; authenticated editing not exercised |
| `/resume` | 302 to configured HTTPS résumé URL; does not itself set download disposition |
| `/myworks`, `/play` | Permanent redirects to Work and Playground |
| Unknown route | 404 with Home, Work, Playground recovery links |
| Metadata routes | `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, `/favicon.ico` |
| APIs | POST chat, feedback, signed revalidation; chat/feedback mocked in interactive tests; no valid CMS revalidation sent |

Fallback slugs: cook, crop-expert, cinematch, spotify-library-organizer, pose-estimation, airbnc, zyra-ai. Runtime suite discovers current slugs from Work.

External destinations and request results: `artifacts/static-audit.json` (fallback-only) plus browser `external-links` attachment (rendered content). Contact mailto exists; no tel links or local résumé PDF found during source recon. Updated external anchors use `newTabProps`; header résumé explicitly includes `noopener noreferrer`.

## Controls, forms and overlays

| Area | Complete source control inventory |
|---|---|
| Shared shell | Wordmark; Work/Playground/résumé; skip link; header/footer Full–Calm; Ask AI; floating chat launcher; footer Home/Back to top; Privacy & motion disclosure |
| Home | View work, scroll cue, chapter dots, project titles, Code/Live links, final rail CTA, skill category chips, falling skill buttons, Enter playground, Start conversation, email link/copy, social links |
| Work | Five category filters; grid/list toggle; case study title/source/live links |
| Case study | All work; TOC anchors; next project; conditional image/gallery enlarge, dialog Close/native Escape, Copy code, comparison range, native video controls, rich-text links |
| Chat | All launchers; Cmd/Ctrl+K; `#ask`; Close; Reset; four suggested prompts; question input (1000 max); Send; Help improve checkbox; privacy disclosure; Helpful/Unhelpful; Retry; error mailto |
| Playground | Free draw; Beat the model; canvas pointer capture; Clear; ten samples; Pause/Resume; +10 seconds; Lock in; Play again; Share score |
| Preloader | Five-second loading dialog; scroll/keyboard lock; no dismiss button; reduced-motion behavior |
| Fullscreen | First qualifying gesture requests fullscreen; Escape exits; notice auto-hides; existing NEXT_PUBLIC_E2E flag can disable it but QA does not set that flag |
| Forms | Chat question only; no email-address form, contact submit form, theme or audio toggle |

## Motion and keyboard

| System | Active behavior |
|---|---|
| Scroll | Lenis desktop Full; project rail pin/horizontal translation, wheel, drag, keyboard; native mobile rail; stacked Calm layout |
| Rail keys | Arrow keys, PageUp/PageDown, Home/End; focused card follows into view |
| GSAP | Chapter reveals, stats, headings, role text, work Flip transitions |
| Motion | Chat enter/exit; skill fall/return and layout |
| Three | Pointer-reactive particles change shape by chapter; tier fallback; WebGL loss fallback; hidden-document render guard |
| CSS | Grain drift, preloader mesh/border; transforms, opacity and blur; hover feedback |
| Accessibility | Tab/Shift+Tab; chat Escape and mobile focus loop; native dialog Escape; reduced-motion preference and saved Full/Calm |

Layout animation source scan found no explicit active GSAP/Motion tweens of top/left/width/height/margin. FLIP/layout animations measure geometry; preloader animates blur in addition to transforms/opacity. RoleLine timeline cleanup and GPU texture disposal require dedicated profiling before calling either a leak.

## Coverage limitations to keep explicit

- Source inventory is broader than current automated assertions. Conditional CMS image/code/comparison/video controls need runtime-present content; no fabricated content is counted as real coverage.
- Rapid-click checks cover initially visible buttons; contextual retry/game-result/modal controls need additional stress testing.
- Canvas inference clear/late-worker race is a source candidate, not reproduced by the sample tests.
- Physical dual-monitor cursor transitions, browser-toolbar cursor rendering, precise perceived bounce, logical keyboard order, and visual text overlap require human review.
- Hidden-tab test measures rAF suspension, not every timer/worker loop.
- Device emulation is not physical iPhone/Android hardware testing. Decorative particle parity is not first-person-level parity.
