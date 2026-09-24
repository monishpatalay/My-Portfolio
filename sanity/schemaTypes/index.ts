/**
 * Sanity schema — Monish Patalay portfolio.
 *
 * Six document types, one per thing the site actually renders. Nothing here is
 * speculative: if a field exists it is read by lib/content/server.ts and shown
 * on a page. If you add a field, add it there too or it will be ignored.
 *
 *   project        → the work rail, /work, and each /work/[slug] case study
 *   experience     → "My career & experience" timeline
 *   education      → "My education & background" timeline
 *   skillCategory  → one filter chip in the skills cloud
 *   stat           → the four numbers below the opening statement
 *   about          → the "A builder at heart." statement below the hero
 */

import {defineType, defineField, defineArrayMember} from 'sanity';

/** Categories double as the filter chips on /work, so they are a fixed list. */
const PROJECT_CATEGORIES = [
  {title: 'AI & ML', value: 'ai-ml'},
  {title: 'Full stack', value: 'full-stack'},
  {title: 'Computer vision', value: 'computer-vision'},
  {title: 'Web', value: 'web'},
];

const orderField = defineField({
  name: 'order',
  title: 'Order',
  type: 'number',
  description: 'Lower numbers appear first.',
});

const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: rule => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'The URL: /work/<slug>. Click Generate.',
      options: {source: 'title'},
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences. Shown on the card and under the case-study title.',
      validation: rule => rule.required().max(200),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Optional. The Google result title; " — Monish Patalay" is appended. Falls back to the title.',
      validation: rule => rule.max(45).warning('Keep it under 45 characters so Google shows it in full.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      description: 'Optional. The Google result snippet: what it is, and the key tech. Falls back to the summary.',
      validation: rule => rule.min(110).max(160).warning('Aim for 110–160 characters.'),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: PROJECT_CATEGORIES, layout: 'radio'},
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      description: 'Featured projects appear in the homepage rail.',
      initialValue: false,
    }),
    orderField,
    defineField({name: 'role', type: 'string', description: 'What you did, e.g. "Machine learning & full-stack development".'}),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: ['Built', 'Deployed', 'In progress']},
      initialValue: 'Built',
    }),
    defineField({name: 'cover', title: 'Cover image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'previewMux',
      title: 'Hover preview video',
      type: 'mux.video',
      description: 'Optional clip shown when this project card is hovered. Upload any video; Mux streams it at up to 1080p and makes the poster.',
    }),
    defineField({
      name: 'color',
      type: 'string',
      description: 'Hex fallback behind the cover, e.g. #c7b5f1.',
      initialValue: '#c7b5f1',
    }),
    defineField({name: 'symbol', type: 'string', description: 'Single decorative glyph, e.g. ✳', initialValue: '✳'}),
    defineField({
      name: 'techs',
      title: 'Technologies',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'links',
      type: 'object',
      fields: [
        defineField({name: 'github', type: 'url'}),
        defineField({name: 'live', title: 'Live site', type: 'url'}),
      ],
    }),
    defineField({
      name: 'metrics',
      type: 'array',
      description: 'Up to four numbers. Every one needs a source note — that is the point of them.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'value', type: 'string', validation: rule => rule.required()}),
            defineField({name: 'label', type: 'string', validation: rule => rule.required()}),
            defineField({
              name: 'sourceNote',
              title: 'Source note',
              type: 'string',
              description: 'Where this number comes from and what it does not claim.',
              validation: rule => rule.required(),
            }),
          ],
          preview: {select: {title: 'value', subtitle: 'label'}},
        }),
      ],
      validation: rule => rule.max(4),
    }),
    defineField({
      name: 'sections',
      title: 'Case study sections',
      type: 'array',
      description: 'Problem, Constraints, Approach, Architecture, Results, What I would do next…',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: rule => rule.required()}),
            defineField({name: 'text', type: 'text', rows: 5, validation: rule => rule.required()}),
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'summary', media: 'cover'}},
});

/** experience and education share a shape; both render through the Timeline. */
const timelineFields = (roleName: string, orgName: string) => [
  defineField({name: roleName, type: 'string', validation: rule => rule.required()}),
  defineField({name: orgName, type: 'string', validation: rule => rule.required()}),
  defineField({
    name: 'period',
    type: 'string',
    description: 'Shown exactly as typed, e.g. "2025 - Present".',
  }),
  defineField({name: 'location', type: 'string', description: 'e.g. "Los Angeles, CA".'}),
  defineField({name: 'description', type: 'text', rows: 3, description: 'One short paragraph.'}),
  defineField({
    name: 'responsibilities',
    title: 'Bullet points',
    type: 'array',
    of: [defineArrayMember({type: 'string'})],
  }),
  defineField({
    name: 'technologies',
    type: 'array',
    of: [defineArrayMember({type: 'string'})],
    options: {layout: 'tags'},
  }),
  orderField,
];

const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: timelineFields('position', 'company'),
  preview: {select: {title: 'position', subtitle: 'company'}},
});

const education = defineType({
  name: 'education',
  title: 'Education',
  type: 'document',
  fields: timelineFields('degree', 'institution'),
  preview: {select: {title: 'degree', subtitle: 'institution'}},
});

const skillCategory = defineType({
  name: 'skillCategory',
  title: 'Skill category',
  type: 'document',
  description: 'Each category becomes one filter chip in the skills cloud.',
  fields: [
    defineField({name: 'title', type: 'string', description: 'The chip label, e.g. "AI ENGINEER".', validation: rule => rule.required()}),
    defineField({
      name: 'tools',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      validation: rule => rule.required().min(1),
    }),
    orderField,
  ],
  preview: {select: {title: 'title'}},
});

const stat = defineType({
  name: 'stat',
  title: 'Stat',
  type: 'document',
  description: 'The numbers below the opening statement.',
  fields: [
    defineField({name: 'value', type: 'string', description: 'e.g. "700+"', validation: rule => rule.required()}),
    defineField({name: 'label', type: 'string', description: 'e.g. "DSA problems solved"', validation: rule => rule.required().max(24)}),
    defineField({
      name: 'sourceNote',
      title: 'Source note',
      type: 'string',
      description: 'Required — a number without a source does not get shown.',
      validation: rule => rule.required(),
    }),
    orderField,
  ],
  preview: {select: {title: 'value', subtitle: 'label'}},
});

const chatFaq = defineType({
  name: 'chatFaq',
  title: 'Chat answer',
  type: 'document',
  description:
    'A curated answer the AI assistant uses when a visitor asks something close to this question. Edit these to change how the assistant replies, without touching code.',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      description: 'The question as a visitor would phrase it.',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'answer',
      type: 'text',
      rows: 6,
      description: 'Plain prose. The assistant may shorten it, but will not contradict it.',
      validation: rule => rule.required(),
    }),
    orderField,
  ],
  preview: {select: {title: 'question', subtitle: 'answer'}},
});

const about = defineType({
  name: 'about',
  title: 'About statement',
  type: 'document',
  description: 'The "A builder at heart." section below the hero. Only the first document is used; the assistant reads it too.',
  fields: [
    defineField({name: 'heading', type: 'string', initialValue: 'A builder at heart.', validation: rule => rule.required()}),
    defineField({name: 'statement', title: 'Paragraph', type: 'text', rows: 5, validation: rule => rule.required()}),
    defineField({name: 'note', title: 'Small note', type: 'string', description: 'Optional line under the paragraph, e.g. "Curious by default. Hands-on by choice."'}),
  ],
  preview: {select: {title: 'heading', subtitle: 'statement'}},
});

const achievement = defineType({
  name: 'achievement',
  title: 'Achievement',
  type: 'document',
  description: 'Publications, awards, leadership and milestones. Shown under the timeline and given to the assistant.',
  fields: [
    defineField({name: 'title', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'detail', type: 'string', description: 'One short supporting line.'}),
    defineField({
      name: 'kind',
      type: 'string',
      options: {list: ['Publication', 'Leadership', 'Competition', 'Academics', 'Problem solving']},
    }),
    orderField,
  ],
  preview: {select: {title: 'title', subtitle: 'kind'}},
});

export const schemaTypes = [about, project, experience, education, skillCategory, stat, achievement, chatFaq];
