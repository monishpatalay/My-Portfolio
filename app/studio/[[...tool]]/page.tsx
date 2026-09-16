import StudioClient from './StudioClient';

export const metadata = {title: 'Portfolio Studio', robots: {index: false, follow: false}};

export default function Studio() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
    return (
      <main id="main" className="page-shell">
        <h1>Studio setup</h1>
        <p>Configure the existing Sanity project ID and dataset to open your content workspace.</p>
      </main>
    );
  return <StudioClient />;
}
