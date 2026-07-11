import { ReactNode } from "react";
import "./styles/Career.css";

interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
}

interface TimelineSectionProps {
  heading: ReactNode;
  items: TimelineItem[];
}

const getDisplayYear = (period: string) => {
  if (period.includes("Present")) return "NOW";
  if (period.includes(" - ")) {
    return period.split(" - ")[0]; // Show start year for ranges
  }
  return period; // Single year like "2021"
};

const TimelineSection = ({ heading, items }: TimelineSectionProps) => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>{heading}</h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {items.map((item, index) => (
            <div key={index} className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{item.title}</h4>
                  <h5>{item.subtitle}</h5>
                  {item.location && (
                    <span className="career-location">{item.location}</span>
                  )}
                </div>
                <h3>{getDisplayYear(item.period)}</h3>
              </div>
              <div className="career-details">
                <p>{item.description}</p>
                {item.responsibilities.length > 0 && (
                  <ul className="career-responsibilities">
                    {item.responsibilities.map((responsibility, i) => (
                      <li key={i}>{responsibility}</li>
                    ))}
                  </ul>
                )}
                {item.technologies.length > 0 && (
                  <div className="career-tags">
                    {item.technologies.map((tech, i) => (
                      <span key={i} className="career-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;
