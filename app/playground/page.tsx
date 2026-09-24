import Playground from '@/components/playground/Playground';
import {baseOpenGraph} from '@/lib/site';
const description='Draw a digit and explore a real neural network running entirely in your browser.';
export const metadata={title:'Neural Doodle — Playground',description,openGraph:{...baseOpenGraph,type:'website',url:'/playground',images:['/opengraph-image'],title:'Neural Doodle — Playground — Monish Patalay',description}};
export default function Page(){return <main id="main" className="page-shell playground-page"><div className="section-kicker">Small experiments. Big curiosity.</div><h1 className="page-title">Human, meet neural net.</h1><p className="page-intro">A scribble is all it takes. Draw a digit, watch the network think, and see if your handwriting can surprise it.</p><Playground/></main>;}
