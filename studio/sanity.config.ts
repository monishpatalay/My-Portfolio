import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

if (!projectId) {
  throw new Error(
    "SANITY_STUDIO_PROJECT_ID is not set. Add it to studio/.env (see studio/.env.example)."
  );
}

export default defineConfig({
  name: "default",
  title: "Monish Patalay — Portfolio CMS",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .child(
                S.document().schemaType("siteSettings").documentId("siteSettings")
              ),
            S.divider(),
            S.documentTypeListItem("experience").title("Experience"),
            S.documentTypeListItem("education").title("Education"),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("skillCategory").title("Skills"),
            S.documentTypeListItem("techStackItem").title("Tech Stack"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
