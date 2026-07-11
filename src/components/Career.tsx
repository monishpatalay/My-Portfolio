import { config } from "../config";
import TimelineSection from "./TimelineSection";

const Career = () => {
  const items = config.experiences.map((exp) => ({
    title: exp.position,
    subtitle: exp.company,
    period: exp.period,
    location: exp.location,
    description: exp.description,
    responsibilities: exp.responsibilities,
    technologies: exp.technologies,
  }));

  return (
    <TimelineSection
      heading={
        <>
          My career <span>&</span>
          <br /> experience
        </>
      }
      items={items}
    />
  );
};

export default Career;
