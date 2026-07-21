import { defineField, defineType } from "sanity";

export default defineType({
  name: "techStackItem",
  title: "Tech Stack Item",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "url",
      title: "Official URL",
      type: "url",
      description: "Where the logo links to when clicked.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers show first (earlier / larger pyramid rows).",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
