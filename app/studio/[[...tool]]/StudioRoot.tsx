/**
 * The actual Studio. Split into its own module so that `sanity` and
 * `next-sanity` are only ever reached through a dynamic, client-only import —
 * see StudioClient.tsx for why that matters.
 */

'use client';

import {NextStudio} from 'next-sanity/studio';
import config from '@/sanity.config';

export default function StudioRoot() {
  return <NextStudio config={config} />;
}
