import Playground from '@/components/playground/Playground';
export const metadata={title:'Neural Doodle — Playground',description:'Draw a digit and explore a real neural network running entirely in your browser.'};
export default function Page(){return <main id="main" className="page-shell playground-page"><div className="section-kicker">Small experiments. Big curiosity.</div><h1 className="page-title">Human, meet neural net.</h1><p className="page-intro">A scribble is all it takes. Draw a digit, watch the network think, and see if your handwriting can surprise it.</p><Playground/></main>;}
