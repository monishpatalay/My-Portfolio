/**
 * Studio is loaded client-only, on purpose.
 *
 * `sanity` pulls in swr, whose react-server build exports no default. If Studio
 * is reachable from the server module graph, Turbopack resolves it through that
 * condition and `next build` fails on `import useSWR from "swr"`.
 *
 * Marking the packages external in next.config.ts also fixes the build, but
 * then Node loads them with their own copy of React and Studio dies at runtime
 * with "Invalid hook call". Keeping them bundled and client-only avoids both:
 * one React, and the browser export condition where swr has its default.
 */

'use client';

import dynamic from 'next/dynamic';

const Studio = dynamic(() => import('./StudioRoot'), {
  ssr: false,
  loading: () => (
    <main id="main" className="page-shell">
      <p className="section-kicker">Loading Studio…</p>
    </main>
  ),
});

export default function StudioClient() {
  return <Studio />;
}
