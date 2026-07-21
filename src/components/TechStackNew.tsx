import "./styles/TechStackNew.css";
import { useSiteData } from "../context/SiteDataProvider";
import { TechStackItem } from "../lib/sanity";

// Chunks the flat, ordered tech list into a decreasing pyramid capped at
// 12 items per row (the container is 1000px wide and each item renders at
// 73px with a 10px gap, so 13+ items on one row wraps and breaks the shape).
// This adapts automatically as items are added/removed in Sanity, instead
// of relying on a hardcoded row layout.
function getPyramidRows(items: TechStackItem[], maxRowSize = 12): TechStackItem[][] {
  const rows: TechStackItem[][] = [];
  let index = 0;
  let rowSize = maxRowSize;
  while (index < items.length) {
    const size = Math.min(rowSize, items.length - index);
    rows.push(items.slice(index, index + size));
    index += size;
    rowSize = Math.max(1, rowSize - 1);
  }
  return rows;
}

const TechStackNew = () => {
  const config = useSiteData();
  const techStack = getPyramidRows(config.techStack);
  return (
    <div className="techstack-new">
      {/* Video Background */}
      <div className="techstack-video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="techstack-video"
        >
          <source src="/video/video.webm" type="video/webm" />
        </video>
        {/* Dark Overlay */}
        <div className="techstack-overlay"></div>
      </div>

      {/* Content */}
      <div className="techstack-content">
        <h2>Tech Stack</h2>
        
        <div className="techstack-pyramid">
          {techStack.map((row, rowIndex) => (
            <div key={rowIndex} className="techstack-row">
              {row.map((tech, techIndex) => (
                <a
                  key={techIndex}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="techstack-item"
                  title={tech.name}
                  data-cursor="disable"
                >
                  <img src={tech.image} alt={tech.name} loading="lazy" />
                  <span>{tech.name}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStackNew;
