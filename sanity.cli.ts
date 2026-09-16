/**
 * Sanity CLI config — used by `sanity deploy` / `sanity build` only.
 *
 * Separate from sanity.config.ts, which configures the Studio workspace itself.
 * `studioHost` is set here so deploying is non-interactive; without it the CLI
 * prompts for a hostname on first run.
 *
 * The embedded Studio at /studio in the Next app is unaffected by this file.
 */

import {defineCliConfig} from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'sw3yldlx',
    dataset: 'production',
  },
  studioHost: 'monish-portfolio',
  // Returned by the first deploy; pinning it keeps later deploys non-interactive.
  deployment: {appId: 'o00ze1pkfmifz8w2wtuz22at'},
});
