import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    pitch: z.string(),
    status: z.string(),
    tech: z.array(z.string()),
    repos: z.array(z.object({ label: z.string(), url: z.url() })),
  }),
});

export const collections = { projects };
