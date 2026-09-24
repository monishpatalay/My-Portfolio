import Link from 'next/link';
import Hero from '@/components/chapters/Hero';
import HomeMotion from '@/components/chapters/HomeMotion';
import Skills from '@/components/chapters/Skills';
import Timeline from '@/components/chapters/Timeline';
import Rail from '@/components/rail/Rail';
import Contact from '@/components/ui/Contact';
import AskButton from '@/components/ui/AskButton';
import {getContent} from '@/lib/content/server';

export default async function Home() {
  const data = await getContent();
  const featured = data.projects.filter(project => project.featured);
  return <main id="main">
    <HomeMotion />
    <Hero profile={data.settings} />
    <section className="chapter statement" id="statement" data-shape="quote" aria-labelledby="statement-title">
      <div className="statement-layout"><h2 id="statement-title" className="section-kicker">{data.settings.statementHeading}</h2><div><p>{data.settings.statement}</p>{data.settings.statementNote&&<p className="small-note">{data.settings.statementNote}</p>}</div></div>
    </section>
    <section className="chapter stats-section" id="numbers" data-shape="bars" aria-labelledby="numbers-title">
      <h2 id="numbers-title" className="sr-only">A few numbers, with context</h2>
      <div className="stats-grid">{data.stats.map(stat => <div className="stat" key={stat.label}><strong className="stat-value">{stat.value}</strong><span className="stat-label">{stat.label}</span><span className="stat-source">{stat.sourceNote}</span></div>)}</div>
    </section>
    <Rail projects={featured.length ? featured : data.projects} />
    <section id="journey" className="chapter timeline-chapter" data-shape="helix" aria-label="Career and education">
      <Timeline eyebrow="The path so far" title="My career & experience" entries={data.journey} />
      <Timeline eyebrow="The foundation" title="My education & background" entries={data.education} />
      {data.achievements.length > 0 && <div className="achievements">
        <p className="section-kicker">Along the way</p>
        <ul>{data.achievements.map(item => <li key={item.title}><strong>{item.title}</strong>{item.detail && <span>{item.detail}</span>}{item.kind && <em>{item.kind}</em>}</li>)}</ul>
      </div>}
    </section>
    <section id="skills" className="chapter light-chapter skills-section" data-chapter-theme="light" data-shape="sphere" aria-labelledby="skills-title">
      <div className="section-kicker">The tools change. The curiosity stays.</div><h2 id="skills-title">A stack for making<br/>things happen.</h2><Skills groups={data.skillGroups}/><p className="learning-note">Exploring deeper: agentic AI systems, production LLM applications, and system design.</p>
    </section>
    <section id="try-it" className="chapter try-section" data-shape="chat" aria-labelledby="try-title">
      <div className="section-head"><div><div className="section-kicker">You’ve scrolled. Now play.</div><h2 id="try-title">A little less reading.<br/>A little more doing.</h2></div></div>
      <div className="try-grid"><article className="try-card"><div className="teaser-doodle" aria-hidden="true">7<span> → 7?</span></div><h3>Human scribble.<br/>Machine guess.</h3><p>Draw a digit. Peek inside a neural network. See if you can beat the model.</p><Link className="button" href="/playground">Enter the playground ↗</Link></article><article className="try-card ai-teaser"><div className="teaser-bubble">“What has Monish built with AI?”</div><h3>Curious about<br/>the person behind it?</h3><p>Ask my AI assistant about the projects, the journey, or the tools I work with.</p><AskButton className="button">Start a conversation ↗</AskButton></article></div>
    </section>
    <Contact profile={data.settings}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Person',name:data.settings.name,url:'https://www.monishpatalay.dev',sameAs:[data.settings.github,data.settings.linkedin],alumniOf:{'@type':'CollegeOrUniversity',name:'California State University, Los Angeles'}}).replaceAll('<','\\u003c')}}/>
  </main>;
}
