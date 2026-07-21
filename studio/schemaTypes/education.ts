import { defineField, defineType } from "sanity";

export default defineType({
  name: "education",
  title: "Education",
  type: "document",
  fields: [
    defineField({ name: "degree", title: "Degree", type: "string", validation: (r) => r.required() }),
    defineField({ name: "institution", title: "Institution", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "period",
      title: "Period",
      type: "string",
      description: 'e.g. "2024 - 2026"',
      validation: (r) => r.required(),
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "description", title: "Summary", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({
      name: "responsibilities",
      title: "Highlights / Bullet Points",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "technologies",
      title: "Coursework / Focus Areas",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers show first (most recent = 1)",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "degree", subtitle: "institution" },
  },
});
