/**
 * Anything that leaves the site opens in a new tab; anything that stays does
 * not.
 *
 * In-page anchors (#work, #section-2, the skip link) and mailto: are
 * deliberately excluded — new-tabbing an anchor breaks the reading position,
 * and a mailto: in a new tab hands the visitor a blank tab to close after
 * their mail client opens.
 *
 * /resume counts as external: the route is a 302 to a different domain.
 *
 * rel="noopener noreferrer" is not optional. Without noopener the opened page
 * can reach back through window.opener and navigate this one.
 */

const NEW_TAB = {target: '_blank', rel: 'noopener noreferrer'} as const;

export function leavesTheSite(href: string | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href) || href === '/resume';
}

/** Spread onto an <a>: `{...newTabProps(href)}`. Empty for in-site links. */
export function newTabProps(href: string | undefined) {
  return leavesTheSite(href) ? NEW_TAB : {};
}
