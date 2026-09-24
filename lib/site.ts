/** Canonical origin for absolute URLs in structured data and social tags. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.monishpatalay.dev';

/**
 * Open Graph fields every page shares. A page that sets its own `openGraph`
 * replaces the layout's object entirely, so pages spread this in.
 */
export const baseOpenGraph = {siteName: 'Monish Patalay', locale: 'en_US'} as const;
