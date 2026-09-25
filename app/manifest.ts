/**
 * Web app manifest.
 *
 * The Fullscreen API cannot be called without a user gesture, so a browser tab
 * can never open fullscreen on its own. An installed PWA can: launching one
 * honours `display`, with no gesture involved. `display_override` lets the
 * platform fall back gracefully — fullscreen where supported, otherwise a
 * chrome-less standalone window.
 *
 * This changes nothing for an ordinary tab visit; it only takes effect once
 * the site is installed.
 */

import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Monish Patalay — AI Engineer & Full-Stack Developer',
    short_name: 'Monish Patalay',
    description:
      'Portfolio of Monish Patalay, M.S. Computer Science at Cal State LA, building intelligent systems and production-grade software end to end.',
    start_url: '/',
    display: 'fullscreen',
    display_override: ['fullscreen', 'standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#0b080c',
    theme_color: '#0b080c',
    icons: [
      {src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any'},
      {src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
      {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
    ],
  };
}
