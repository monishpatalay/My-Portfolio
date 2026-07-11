import { config } from "../config";
import TimelineSection from "./TimelineSection";

const Education = () => {
  const items = config.education.map((edu) => ({
    title: edu.degree,
    subtitle: edu.institution,
    period: edu.period,
    location: edu.location,
    description: edu.description,
    responsibilities: edu.responsibilities,
    technologies: edu.technologies,
  }));

  return (
    <TimelineSection
      heading={
        <>
          My education <span>&</span>
          <br /> background
        </>
      }
      items={items}
    />
  );
};

export default Education;
