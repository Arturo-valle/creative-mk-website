/**
 * Measure how independent the Spanish actually is, and refuse to let the
 * published figure drift from it.
 *
 * The site publishes two numbers about its own Spanish, in a FAQ answer that
 * argues a number without a source is decoration. Those numbers were typed by
 * hand, and within one commit of being written they were already wrong: a
 * later edit to the same corpus moved 121/122 to 122/122 silently. That is the
 * "6 min read over ninety words" failure this repository has named twice and
 * fixed twice by deriving the number instead of typing it.
 *
 * This measures the corpus and fails the build if the copy disagrees.
 *
 * The test: independently authored prose in two languages does not preserve
 * the other's sentence count paragraph by paragraph. Translation held to the
 * source's envelope does. An adversarial review used exactly this to disprove
 * "the Spanish is written, not translated", and the honest answer was to
 * publish the measurement rather than soften the claim.
 *
 * Usage: node scripts/measure-bilingual.mjs [--report]
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = async (name) => (await import(new URL(`../src/_data/${name}`, import.meta.url).href)).default;

const sentences = (text) =>
  String(text)
    .split(/(?<=[.!?…])\s+(?=[¿¡"“(]?[A-ZÁÉÍÓÚÑ0-9])/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 1).length;

const words = (text) => String(text).trim().split(/\s+/).filter(Boolean).length;

const services = await load('services.js');
const cases = await load('cases.js');

let identical = 0;
let total = 0;
let esWords = 0;
let enWords = 0;

const compare = (en, es) => {
  if (!en || !es) return;
  total += 1;
  esWords += words(es);
  enWords += words(en);
  if (sentences(en) === sentences(es)) identical += 1;
};

for (const service of services) {
  service.en.intro.forEach((p, i) => compare(p, service.es.intro[i]));
  for (const field of ['desc', 'proof', 'hook', 'proofNote']) compare(service.en[field], service.es[field]);
  service.en.deliverables.forEach((d, i) => compare(d.detail, service.es.deliverables[i]?.detail));
  service.en.engagements.forEach((e, i) => compare(e.includes, service.es.engagements[i]?.includes));
  service.en.faqs.forEach((f, i) => compare(f.a, service.es.faqs[i]?.a));
}
for (const entry of cases) {
  for (const field of ['challenge', 'approach', 'result', 'businessFrame']) {
    compare(entry.en[field], entry.es[field]);
  }
}

const ratio = esWords / enWords;
const longerPct = Math.round((ratio - 1) * 100);

console.log(`Paired prose blocks (services + cases): ${total}`);
console.log(`Identical sentence counts            : ${identical}  (${((identical / total) * 100).toFixed(1)}%)`);
console.log(`ES/EN word ratio                     : ${ratio.toFixed(3)}  (Spanish ${longerPct}% longer)`);

/* The published claim has to agree with the measurement above. Both figures
   appear in the branding and UX/UI FAQ answers, in both languages. */
const source = await readFile(resolve(root, 'src/_data/services.js'), 'utf8');
const problems = [];

const publishedTotals = [...source.matchAll(/(\d+)\s+(?:keep the English sentence count|paired passages|pasajes emparejados|conservan exactamente)/g)];
for (const match of publishedTotals) {
  const value = Number(match[1]);
  if (value !== total && value !== identical) {
    problems.push(`copy publishes "${value}" where the corpus measures ${identical} of ${total}`);
  }
}
for (const match of source.matchAll(/(\d+)%\s*(?:longer|más largo)/g)) {
  if (Number(match[1]) !== longerPct) {
    problems.push(`copy publishes "${match[1]}% longer" where the corpus measures ${longerPct}%`);
  }
}

if (problems.length) {
  console.log('\nPUBLISHED FIGURES DISAGREE WITH THE MEASUREMENT:');
  for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('\nPublished figures agree with the measurement.');
