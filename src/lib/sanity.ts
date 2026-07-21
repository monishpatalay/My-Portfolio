import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

interface SanityImageSource {
  asset?: { _ref: string; _type: "reference" };
  _type?: string;
}

interface ExperienceItem {
  position: string;
  company: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
}

interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
}

interface ProjectItem {
  id: number;
  title: string;
  category: string;
  technologies: string;
  image: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
}

interface SkillCategory {
  title: string;
  description: string;
  details: string;
  tools: string[];
}

export interface TechStackItem {
  name: string;
  url: string;
  image: string;
}

export interface SiteData {
  developer: { name: string; fullName: string; title: string; description: string };
  social: { github: string; email: string; location: string };
  about: { title: string; description: string };
  experiences: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  contact: { email: string; github: string; linkedin: string };
  skills: { develop: SkillCategory; design: SkillCategory };
  techStack: TechStackItem[];
}

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.VITE_SANITY_DATASET as string | undefined) || "production";

export const isSanityConfigured = Boolean(projectId);

const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      // Skip the CDN in dev so local testing always sees the latest
      // published content instead of a cached response.
      useCdn: !import.meta.env.DEV,
    })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

function urlForImage(source: SanityImageSource, fallback: string): string {
  if (!builder || !source) return fallback;
  return builder.image(source).auto("format").url();
}

interface SiteSettingsDoc {
  developerName?: string;
  developerFullName?: string;
  developerTitle?: string;
  developerDescription?: string;
  githubUsername?: string;
  email?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  aboutTitle?: string;
  aboutDescription?: string;
}

interface ExperienceDoc {
  position: string;
  company: string;
  period: string;
  location?: string;
  description: string;
  responsibilities?: string[];
  technologies?: string[];
}

interface EducationDoc {
  degree: string;
  institution: string;
  period: string;
  location?: string;
  description: string;
  responsibilities?: string[];
  technologies?: string[];
}

interface ProjectDoc {
  _id: string;
  title: string;
  category?: string;
  technologies?: string;
  image?: SanityImageSource;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
}

interface SkillCategoryDoc {
  key: "develop" | "design";
  title: string;
  description: string;
  details: string;
  tools?: string[];
}

interface TechStackItemDoc {
  name: string;
  url?: string;
  logo?: SanityImageSource;
}

interface RawSiteQueryResult {
  settings: SiteSettingsDoc | null;
  experiences: ExperienceDoc[];
  education: EducationDoc[];
  projects: ProjectDoc[];
  skills: SkillCategoryDoc[];
  techStack: TechStackItemDoc[];
}

const SITE_QUERY = `{
  "settings": *[_type == "siteSettings"][0],
  "experiences": *[_type == "experience"] | order(order asc),
  "education": *[_type == "education"] | order(order asc),
  "projects": *[_type == "project"] | order(order asc),
  "skills": *[_type == "skillCategory"],
  "techStack": *[_type == "techStackItem"] | order(order asc)
}`;

/**
 * Fetches all portfolio content from Sanity in one request and reshapes it
 * to match the existing `config.ts` shape, so every component that already
 * consumes that shape keeps working unchanged. Returns null if Sanity isn't
 * configured or the request fails, so callers can fall back to config.ts.
 */
export async function fetchSiteData(fallbackImage: string): Promise<SiteData | null> {
  if (!sanityClient) return null;

  try {
    const result = await sanityClient.fetch<RawSiteQueryResult>(SITE_QUERY);
    const { settings, experiences, education, projects, skills, techStack } = result;

    if (!settings) return null;

    const develop = skills.find((s) => s.key === "develop");
    const design = skills.find((s) => s.key === "design");
    if (!develop || !design) return null;

    return {
      developer: {
        name: settings.developerName || "",
        fullName: settings.developerFullName || "",
        title: settings.developerTitle || "",
        description: settings.developerDescription || "",
      },
      social: {
        github: settings.githubUsername || "",
        email: settings.email || "",
        location: settings.location || "",
      },
      about: {
        title: settings.aboutTitle || "About Me",
        description: settings.aboutDescription || "",
      },
      experiences: experiences.map((e) => ({
        position: e.position,
        company: e.company,
        period: e.period,
        location: e.location || "",
        description: e.description,
        responsibilities: e.responsibilities || [],
        technologies: e.technologies || [],
      })),
      education: education.map((e) => ({
        degree: e.degree,
        institution: e.institution,
        period: e.period,
        location: e.location || "",
        description: e.description,
        responsibilities: e.responsibilities || [],
        technologies: e.technologies || [],
      })),
      projects: projects.map((p, index) => ({
        id: index + 1,
        title: p.title,
        category: p.category || "",
        technologies: p.technologies || "",
        image: p.image ? urlForImage(p.image, fallbackImage) : fallbackImage,
        description: p.description,
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
      })),
      contact: {
        email: settings.email || "",
        github: settings.githubUrl || "",
        linkedin: settings.linkedinUrl || "",
      },
      skills: {
        develop: {
          title: develop.title,
          description: develop.description,
          details: develop.details,
          tools: develop.tools || [],
        },
        design: {
          title: design.title,
          description: design.description,
          details: design.details,
          tools: design.tools || [],
        },
      },
      techStack: techStack.map((t) => ({
        name: t.name,
        url: t.url || "",
        image: t.logo ? urlForImage(t.logo, fallbackImage) : fallbackImage,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch site data from Sanity:", error);
    return null;
  }
}
