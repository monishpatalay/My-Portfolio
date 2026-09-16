import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/typography.css";
import "@/styles/motion.css";
import "@/styles/timeline.css";
import "./globals.css";
import "@/styles/media-cursor.css";
import "@/styles/preloader.css";
import SiteShell from "@/components/ui/SiteShell";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.monishpatalay.dev"),
  title: {default: "Monish Patalay — AI Engineer & Full-Stack Developer", template: "%s — Monish Patalay"},
  description:
    "Portfolio of Monish Patalay, M.S. Computer Science at Cal State LA, building intelligent systems and production-grade software end to end.",
};

// Pre-paint motion mode — PRD §14.4. Reads the explicit choice (cookie,
// falling back to localStorage) and stamps it on <html> before first paint,
// so there is no flash. If there is no explicit choice, the attribute is
// left unset and the prefers-reduced-motion media query in
// styles/tokens.css decides instead.
const MOTION_PREPAINT_SCRIPT = `
(function () {
  try {
    var m = document.cookie.match(/(?:^|; )motion-mode=(full|calm)/);
    var mode = m ? m[1] : localStorage.getItem('motion-mode');
    if (mode === 'full' || mode === 'calm') {
      document.documentElement.dataset.motion = mode;
    }
    var t = document.cookie.match(/(?:^|; )theme=(dark|light)/);
    var theme = t ? t[1] : localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.dataset.theme = theme;
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html suppressHydrationWarning lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: MOTION_PREPAINT_SCRIPT }} />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
