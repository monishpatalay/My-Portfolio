import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";
import { fetchSiteData, isSanityConfigured, SiteData } from "../lib/sanity";

const FALLBACK_IMAGE = "/images/placeholder.webp";

const STATIC_SITE_DATA: SiteData = {
  developer: config.developer,
  social: config.social,
  about: config.about,
  experiences: config.experiences,
  education: config.education,
  projects: config.projects,
  contact: config.contact,
  skills: config.skills,
  techStack: config.techStack,
};

const SiteDataContext = createContext<SiteData>(STATIC_SITE_DATA);

export const SiteDataProvider = ({ children }: PropsWithChildren) => {
  const [data, setData] = useState<SiteData>(STATIC_SITE_DATA);

  useEffect(() => {
    if (!isSanityConfigured) return;
    let isCancelled = false;

    fetchSiteData(FALLBACK_IMAGE).then((siteData) => {
      if (!isCancelled && siteData) {
        // Tech stack items may not be migrated into Sanity yet; don't blank
        // out the section in that transitional state.
        if (siteData.techStack.length === 0) {
          siteData.techStack = STATIC_SITE_DATA.techStack;
        }
        setData(siteData);
        // Every pinned section (Career, Education, Work, ...) resizes when
        // live data replaces the static fallback, which can shift the
        // absolute page offsets each section's own ScrollTrigger baked in
        // when it refreshed. Re-measure everything once more after React
        // has committed the new layout and the browser has painted it.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!isCancelled) ScrollTrigger.refresh();
          });
        });
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
};

export const useSiteData = (): SiteData => useContext(SiteDataContext);
