/**
 * Review what visitors saved with "Help improve" in the chat: each question,
 * the model's answer, and their rating (if any). Records expire after 90 days.
 *
 * Read-only. Runs locally with the Upstash keys already in .env.local, so no
 * review page or admin login is exposed on the public site.
 *
 *   pnpm feedback              # newest first
 *   pnpm feedback --down       # only "Not quite" answers
 */
import {Redis} from '@upstash/redis';

type Saved = {question: string; modelAnswer: string; askedAt: string; rating: 'up' | 'down' | null};

const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set (see .env.local).');
  process.exit(1);
}
const redis = new Redis({url, token});

const keys: string[] = [];
let cursor = '0';
do {
  const [next, batch] = await redis.scan(cursor, {match: 'portfolio:question:*', count: 200});
  keys.push(...batch);
  cursor = String(next);
} while (cursor !== '0');

// ponytail: one MGET for everything; page it if saved questions ever reach the thousands.
const records = keys.length ? (await redis.mget<(Saved | null)[]>(...keys)).filter((r): r is Saved => r !== null) : [];
const onlyDown = process.argv.includes('--down');
const shown = records
  .filter(r => !onlyDown || r.rating === 'down')
  .sort((a, b) => b.askedAt.localeCompare(a.askedAt));

const label = {up: 'Helpful', down: 'Not quite'} as const;
for (const r of shown) {
  console.log(`\n${r.askedAt.slice(0, 16).replace('T', ' ')}  ·  ${r.rating ? label[r.rating] : 'not rated'}`);
  console.log(`Q: ${r.question}`);
  console.log(`A: ${r.modelAnswer}`);
}
const count = (rating: Saved['rating']) => records.filter(r => r.rating === rating).length;
console.log(`\n${records.length} saved · ${count('up')} helpful · ${count('down')} not quite · ${count(null)} not rated${onlyDown ? ` · showing ${shown.length}` : ''}`);
