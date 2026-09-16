type Entry = {
  role: string;
  organization: string;
  period: string;
  location: string;
  text: string;
  bullets: string[];
  techs: string[];
};

export default function Timeline({eyebrow,title,entries}:{eyebrow:string;title:string;entries:Entry[]}) {
  return <div className="timeline-block">
    <div className="timeline-heading"><p className="section-kicker">{eyebrow}</p><h2>{title}<span>.</span></h2></div>
    <div className="timeline-rows"><i className="timeline-spine" aria-hidden="true"><b /></i>
      {entries.map(entry => <article className="timeline-row" key={`${entry.role}-${entry.period}`}>
        <div className="timeline-identity"><h3>{entry.role}</h3><h4>{entry.organization}</h4><p>{entry.location}</p></div>
        <time>{entry.period}</time>
        <div className="timeline-detail"><p>{entry.text}</p><ul>{entry.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul><div className="tags">{entry.techs.map(tech => <span className="tag" key={tech}>{tech}</span>)}</div></div>
      </article>)}
    </div>
  </div>;
}
