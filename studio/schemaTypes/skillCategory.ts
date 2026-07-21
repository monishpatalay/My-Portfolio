import { defineField, defineType } from "sanity";

export default defineType({
  name: "skillCategory",
  title: "Skill Category",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      description: 'Internal identifier used by the site (keep as "develop" or "design")',
      options: { list: [{ title: "Develop (AI)", value: "develop" }, { title: "Design (Full-Stack)", value: "design" }] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", title: "Title", type: "string", description: 'e.g. "AI ENGINEER"', validation: (r) => r.required() }),
    defineField({ name: "description", title: "Short Description", type: "string", validation: (r) => r.required() }),
    defineField({ name: "details", title: "Full Details", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({
      name: "tools",
      title: "Tools",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "key" },
  },
});
