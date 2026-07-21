import "./styles/About.css";
import { useSiteData } from "../context/SiteDataProvider";

const About = () => {
  const config = useSiteData();
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        <p className="para">
          {config.about.description}
        </p>
      </div>
    </div>
  );
};

export default About;
