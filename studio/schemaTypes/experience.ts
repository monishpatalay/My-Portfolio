import { defineField, defineType } from "sanity";

export default defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({ name: "position", title: "Position", type: "string", validation: (r) => r.required() }),
    defineField({ name: "company", title: "Company", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "period",
      title: "Period",
      type: "string",
      description: 'e.g. "2023 - 2024" or "2025 - Present"',
      validation: (r) => r.required(),
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "description", title: "Summary", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({
      name: "responsibilities",
      title: "Responsibilities / Bullet Points",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "technologies",
      title: "Technologies",
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
    select: { title: "position", subtitle: "company" },
  },
});
