# Production portfolio QA

```sh
pnpm exec playwright install chromium firefox webkit
pnpm test:e2e
```

The suite builds the current app and starts `next start` on port 3100. It refuses to reuse a dev server. Default execution is serial. The `performance` project launches headed Chromium and applies CDP 4x CPU throttling; keep the machine otherwise idle.

```sh
pnpm test:e2e --project chromium --project firefox --project webkit --workers 3
pnpm test:e2e --project performance
node tests/e2e/static-audit.mjs
```

Do not run performance alongside other browser tests. HTML/JSON reports, screenshots, traces, videos and observer data are under `artifacts/`. Use `pnpm exec playwright show-trace <trace.zip>` for a failure. The final human-reviewed report is `REPORT.md`; it distinguishes application failures, local preview limitations, and missing/manual coverage.

Lighthouse (while production preview is running):

```sh
pnpm dlx lighthouse http://127.0.0.1:3100 --output=json --output=html --output-path=tests/e2e/artifacts/lighthouse --chrome-flags=--headless
```

No application test hooks were added. Browser instrumentation uses `window.__qaMetrics`, rAF/PerformanceObserver, CDP CPU/heap controls, and WebGL's context-loss extension. Chat/feedback are intercepted with synthetic responses; tests never send questions to the real AI provider or save feedback to the real database. The app's preloader/fullscreen behavior remains enabled.
