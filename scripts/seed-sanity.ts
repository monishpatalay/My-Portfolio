/**
 * Seed a fresh Sanity dataset from the reviewed content in lib/content/data.ts.
 *
 * Point NEXT_PUBLIC_SANITY_PROJECT_ID at a new, empty project, then run this.
 * It creates one document per thing the site renders, using exactly the field
 * names declared in sanity/schemaTypes/index.ts, so Studio and the site agree
 * from the first minute.
 *
 * Safe to re-run: every document gets a deterministic _id and is written with
 * createOrReplace, so a second run overwrites rather than duplicates. That also
 * means it discards edits made in Studio — seed once, then edit there.
 *
 *   pnpm exec tsx scripts/seed-sanity.ts                                   # dry run
 *   SANITY_WRITE_TOKEN=... pnpm exec tsx scripts/seed-sanity.ts --commit   # write
 */

import {randomUUID} from 'node:crypto';
// via next-sanity: @sanity/client is a transitive dep and pnpm keeps it unhoisted.
import {createClient} from 'next-sanity';
import {projects, stats, journey, education, skillGroups, achievements, chatFaqs} from '../lib/content/data';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN;
const commit = process.argv.includes('--commit');

if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set');
if (commit && !token) throw new Error('SANITY_WRITE_TOKEN is not set — create an Editor token at sanity.io/manage');

const client = createClient({projectId, dataset, apiVersion: '2026-09-01', useCdn: false, ...(token ? {token} : {})});

// Sanity requires a _key on every object inside an array.
const keyed = <T extends object>(items: T[]) => items.map(item => ({...item, _key: randomUUID()}));
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Doc = Record<string, unknown> & {_id: string; _type: string};
const docs: Doc[] = [];

projects.forEach((project, index) => {
  docs.push({
    _id: `project-${project.slug}`,
    _type: 'project',
    title: project.title,
    slug: {_type: 'slug', current: project.slug},
    summary: project.summary,
    category: project.category,
    featured: project.featured,
    order: index,
    role: project.role,
    status: project.status,
    color: project.color,
    symbol: project.symbol,
    techs: project.techs,
    links: {github: project.github, live: project.live},
    metrics: keyed(project.metrics),
    sections: keyed(project.sections),
  });
});

journey.forEach((entry, index) => {
  docs.push({
    _id: `experience-${slugify(entry.organization)}-${index}`,
    _type: 'experience',
    position: entry.role,
    company: entry.organization,
    period: entry.period,
    location: entry.location,
    description: entry.text,
    responsibilities: entry.bullets,
    technologies: entry.techs,
    order: index,
  });
});

education.forEach((entry, index) => {
  docs.push({
    _id: `education-${slugify(entry.organization)}-${index}`,
    _type: 'education',
    degree: entry.role,
    institution: entry.organization,
    period: entry.period,
    location: entry.location,
    description: entry.text,
    responsibilities: entry.bullets,
    technologies: entry.techs,
    order: index,
  });
});

Object.entries(skillGroups).forEach(([title, tools], index) => {
  docs.push({_id: `skill-category-${slugify(title)}`, _type: 'skillCategory', title, tools, order: index});
});

achievements.forEach((item, index) => {
  docs.push({_id: `achievement-${slugify(item.title)}`, _type: 'achievement', ...item, order: index});
});

chatFaqs.forEach((faq, index) => {
  docs.push({_id: `chat-faq-${index}`, _type: 'chatFaq', ...faq, order: index});
});

stats.forEach((stat, index) => {
  docs.push({_id: `stat-${index}`, _type: 'stat', ...stat, order: index});
});

async function main() {
  const counts = docs.reduce<Record<string, number>>((acc, doc) => ({...acc, [doc._type]: (acc[doc._type] ?? 0) + 1}), {});
  console.log(`Target: ${projectId}/${dataset}\n`);
  for (const [type, count] of Object.entries(counts)) console.log(`  ${String(count).padStart(3)} ${type}`);

  if (!commit) {
    console.log(`\nDry run — nothing written. ${docs.length} documents would be created.`);
    console.log('Re-run with --commit to apply.');
    return;
  }

  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();
  console.log(`\nDone. Wrote ${docs.length} documents.`);
}

main().catch(error => {
  console.error('Seed failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
