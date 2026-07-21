import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: 'e.g. "AI / Full Stack"',
    }),
    defineField({
      name: "technologies",
      title: "Technologies",
      type: "string",
      description: 'Comma-separated, e.g. "React, TypeScript, Node.js"',
    }),
    defineField({
      name: "image",
      title: "Screenshot",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({
      name: "githubUrl",
      title: "GitHub URL",
      type: "url",
      description: "Link to the repo. Leave empty to hide the Code button.",
    }),
    defineField({
      name: "liveUrl",
      title: "Live / Deployed URL",
      type: "url",
      description: "Link to the live demo. Leave empty to hide the Live button.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers show first",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
  },
});
