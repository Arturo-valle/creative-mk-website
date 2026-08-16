/**
 * Prove the i18n value gate fails when it should.
 *
 * The gate in check-site.mjs compares each data-i18n element's rendered text
 * against the dictionary. Its first version reported success whether it had
 * inspected 1,942 elements or three: seven HTML constructs produced no match
 * at all and one compared truncated text, and none of them emitted a
 * diagnostic. A gate that cannot fail is decoration, and the only way to know
 * this one can is to break something on purpose and watch it complain.
 *
 * Each fixture below is a page carrying exactly one defect the gate must
 * catch. Two of them — a single-quoted attribute and a ">" inside an earlier
 * attribute — were still missed after the first hardening, because the
 * counter that was supposed to notice unread elements shared the reader's
 * blind spots. That is why the counter is now quote-agnostic and tag-free.
 *
 * Usage: node scripts/test-i18n-gate.mjs   (exit 1 if any fixture goes unseen)
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const page = (body) => `<!DOCTYPE html>
<html lang="en" data-alt-en="/gate-fixture" data-alt-es="/gate-fixture">
<head><title>Gate fixture | CREATIVE MK</title>
<meta name="description" content="A fixture used to prove the i18n gate fails when it should.">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://creativemk.net/gate-fixture">
<meta property="og:image" content="https://creativemk.net/Logos/logo-dark.png">
<meta name="twitter:image" content="https://creativemk.net/Logos/logo-dark.png">
</head><body><main><h1>Fixture</h1>${body}</main></body></html>`;

/* nav.work is "Work" in the en dictionary. Each fixture breaks it differently. */
const FIXTURES = {
  'plain mismatch (control)': '<span data-i18n="nav.work">Totally wrong</span>',
  'nested same tag hides the tail':
    '<div data-i18n="nav.work">Work<div>x</div> AND A COMPLETELY WRONG TAIL</div>',
  'single-quoted attribute': "<span data-i18n='nav.work'>Totally wrong</span>",
  'void element': '<input data-i18n="nav.work" value="Totally wrong">',
  'greater-than inside an earlier attribute':
    '<span title="a > b" data-i18n="nav.work">Totally wrong</span>',
  'empty element': '<span data-i18n="nav.work"></span>',
  'placeholder mismatch':
    '<input data-i18n-placeholder="footer.emailPlaceholder" placeholder="Totally wrong">',
  'alt shows the same language instead of the other':
    '<span data-i18n-alt="footer.ctaTitle">Let\'s Talk</span>'
};

const run = () => {
  try {
    const out = execFileSync('node', [join(root, 'scripts/check-site.mjs')], {
      cwd: root, encoding: 'utf8'
    });
    return Number(out.match(/(\d+) error\(s\)/)?.[1] ?? 0);
  } catch (e) {
    return Number((e.stdout ?? '').match(/(\d+) error\(s\)/)?.[1] ?? -1);
  }
};

const target = join(dist, 'gate-fixture.html');
const baseline = run();
console.log(`baseline errors with a clean dist/: ${baseline}\n`);

let caught = 0;
for (const [name, body] of Object.entries(FIXTURES)) {
  writeFileSync(target, page(body), 'utf8');
  const errors = run();
  const detected = errors > baseline;
  if (detected) caught += 1;
  console.log(`${detected ? 'CAUGHT  ' : 'MISSED  '} ${name}  (errors ${baseline} -> ${errors})`);
}
if (existsSync(target)) unlinkSync(target);

console.log(`\n${caught}/${Object.keys(FIXTURES).length} constructs detected.`);
process.exit(caught === Object.keys(FIXTURES).length ? 0 : 1);
