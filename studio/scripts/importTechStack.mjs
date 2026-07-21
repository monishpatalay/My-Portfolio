// One-time script to seed Sanity with the tech stack pyramid, uploading
// each logo (currently hosted on external CDNs) as a real Sanity image
// asset instead of just storing the external URL.
// Run from studio/: npm run import-techstack
// Requires SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_WRITE_TOKEN in studio/.env

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Flat, ordered list — mirrors src/config.ts's techStack array.
const techStack = [
  { name: "Python", url: "https://python.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", url: "https://typescriptlang.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "C", url: "https://en.cppreference.com/w/c", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  { name: "C++", url: "https://isocpp.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  { name: "Java", url: "https://www.java.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "SQL", url: "https://en.wikipedia.org/wiki/SQL", image: "https://img.icons8.com/color/48/sql.png" },
  { name: "Kotlin", url: "https://kotlinlang.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },
  { name: "HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "Bash", url: "https://www.gnu.org/software/bash/", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg" },
  { name: "React", url: "https://react.dev", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Next.js", url: "https://nextjs.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "Bootstrap", url: "https://getbootstrap.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
  { name: "Node.js", url: "https://nodejs.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Express.js", url: "https://expressjs.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
  { name: "Django", url: "https://djangoproject.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
  { name: "Flask", url: "https://flask.palletsprojects.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
  { name: "FastAPI", url: "https://fastapi.tiangolo.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
  { name: "GraphQL", url: "https://graphql.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
  { name: "TensorFlow", url: "https://tensorflow.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
  { name: "PyTorch", url: "https://pytorch.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
  { name: "Scikit-learn", url: "https://scikit-learn.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg" },
  { name: "OpenCV", url: "https://opencv.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg" },
  { name: "MLflow", url: "https://mlflow.org", image: "https://cdn.simpleicons.org/mlflow" },
  { name: "NumPy", url: "https://numpy.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg" },
  { name: "Tailwind", url: "https://tailwindcss.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Pandas", url: "https://pandas.pydata.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
  { name: "MySQL", url: "https://mysql.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "PostgreSQL", url: "https://postgresql.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "MongoDB", url: "https://mongodb.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "Firebase", url: "https://firebase.google.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  { name: "Redis", url: "https://redis.io", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
  { name: "Docker", url: "https://docker.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Kubernetes", url: "https://kubernetes.io", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
  { name: "Azure", url: "https://azure.microsoft.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
  { name: "Git", url: "https://git-scm.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "GitHub", url: "https://github.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
  { name: "GitHub Actions", url: "https://github.com/features/actions", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-plain.svg" },
  { name: "Linux", url: "https://linux.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
  { name: "AWS", url: "https://aws.amazon.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "VS Code", url: "https://code.visualstudio.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
  { name: "Vercel", url: "https://vercel.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" },
  { name: "TensorFlow Serving", url: "https://www.tensorflow.org/tfx/guide/serving", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
  { name: "Jupyter", url: "https://jupyter.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg" },
  { name: "Figma", url: "https://figma.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { name: "Postman", url: "https://postman.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
  { name: "REST APIs", url: "https://en.wikipedia.org/wiki/REST", image: "https://img.icons8.com/color/48/api-settings.png" },
  { name: "CNNs", url: "https://en.wikipedia.org/wiki/Convolutional_neural_network", image: "https://img.icons8.com/color/48/artificial-intelligence.png" },
  { name: "Photoshop", url: "https://adobe.com/products/photoshop", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg" },
  { name: "Hugging Face", url: "https://huggingface.co", image: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg" },
  { name: "Claude", url: "https://www.anthropic.com/claude", image: "https://cdn.simpleicons.org/anthropic" },
  { name: "Gemini", url: "https://gemini.google.com", image: "https://cdn.simpleicons.org/googlegemini" },
  { name: "Recommender Systems", url: "https://en.wikipedia.org/wiki/Recommender_system", image: "https://img.icons8.com/color/48/filter.png" },
  { name: "MS Office", url: "https://www.microsoft.com/microsoft-365", image: "https://img.icons8.com/color/48/microsoft-office-2019.png" },
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uploadLogo(item) {
  const res = await fetch(item.image);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${item.image}: ${res.status} ${res.statusText}`);
  }
  const contentType = res.headers.get("content-type") || "image/svg+xml";
  const ext = contentType.includes("svg") ? "svg" : contentType.includes("png") ? "png" : "img";
  const buffer = Buffer.from(await res.arrayBuffer());
  return client.assets.upload("image", buffer, {
    filename: `${slugify(item.name)}.${ext}`,
    contentType,
  });
}

async function run() {
  if (!process.env.SANITY_STUDIO_PROJECT_ID) {
    console.error("Missing SANITY_STUDIO_PROJECT_ID. Set up studio/.env first (see .env.example).");
    process.exit(1);
  }
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error("Missing SANITY_WRITE_TOKEN. Create one at sanity.io/manage (Editor permissions).");
    process.exit(1);
  }

  const existing = await client.fetch(`count(*[_type == "techStackItem"])`);
  if (existing > 0) {
    console.error(
      `Found ${existing} existing techStackItem document(s). Delete them in Studio first if you want to re-run this import (avoids duplicates).`
    );
    process.exit(1);
  }

  console.log(`Uploading ${techStack.length} logos and creating tech stack items...`);
  let order = 1;
  for (const item of techStack) {
    process.stdout.write(`  [${order}/${techStack.length}] ${item.name}... `);
    const asset = await uploadLogo(item);
    await client.create({
      _type: "techStackItem",
      name: item.name,
      url: item.url,
      logo: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      order,
    });
    console.log("done");
    order += 1;
  }

  console.log("Done! Open the Studio to see your tech stack.");
}

run().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
