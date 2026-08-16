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
/* Each fixture pairs a defect with the diagnostic the gate must emit for it.
   Asserting only "errors went up" is what let two deleted guards pass: the
   plain value comparison fired instead and the count still rose. */
const FIXTURES = {
  'plain mismatch (control)': {
    body: '<span data-i18n="nav.work">Totally wrong</span>',
    expect: 'but en says'
  },
  'nested same tag hides the tail': {
    body: '<div data-i18n="nav.work">Work<div>x</div> AND A COMPLETELY WRONG TAIL</div>',
    expect: 'cannot be verified'
  },
  'single-quoted attribute': {
    body: "<span data-i18n='nav.work'>Totally wrong</span>",
    expect: 'could be read'
  },
  'unquoted attribute': {
    body: '<span data-i18n=nav.work>Totally wrong</span>',
    expect: 'could be read'
  },
  'uppercase attribute name': {
    body: '<span DATA-I18N="nav.work">Totally wrong</span>',
    expect: 'could be read'
  },
  'void element': {
    body: '<input data-i18n="nav.work" value="Totally wrong">',
    expect: 'could be read'
  },
  'greater-than inside an earlier attribute': {
    body: '<span title="a > b" data-i18n="nav.work">Totally wrong</span>',
    expect: 'could be read'
  },
  'empty element': {
    body: '<span data-i18n="nav.work"></span>',
    expect: 'the dictionary would overwrite nothing visible'
  },
  'href diverges from the dictionary': {
    body: '<p data-i18n="servicesPage.close">Nothing here is a package. Every engagement starts with a written proposal that names the scope, the deliverables and the price — see the <a href="/privacy/">terms</a>.</p>',
    expect: 'dictionary links to'
  },
  'placeholder mismatch': {
    body: '<input data-i18n-placeholder="footer.emailPlaceholder" placeholder="Totally wrong">',
    expect: 'but en says'
  },
  'unreadable placeholder binding': {
    body: "<input data-i18n-placeholder='footer.emailPlaceholder' placeholder='x'>",
    expect: 'cannot read'
  },
  'alt shows the same language instead of the other': {
    body: `<span data-i18n-alt="footer.ctaTitle">Let's Talk</span>`,
    expect: 'must show the other language'
  },
  'unreadable alt binding': {
    body: "<span data-i18n-alt='footer.ctaTitle'>x</span>",
    expect: 'cannot read'
  }
};

const run = () => {
  try {
    return execFileSync('node', [join(root, 'scripts/check-site.mjs')], {
      cwd: root, encoding: 'utf8'
    });
  } catch (e) {
    return e.stdout ?? '';
  }
};
const errorsIn = (out) => Number(out.match(/(\d+) error\(s\)/)?.[1] ?? -1);

const target = join(dist, 'gate-fixture.html');
const baseline = errorsIn(run());
console.log(`baseline errors with a clean dist/: ${baseline}
`);

let caught = 0;
const names = Object.keys(FIXTURES);
for (const [name, { body, expect }] of Object.entries(FIXTURES)) {
  writeFileSync(target, page(body), 'utf8');
  const out = run();
  const errors = errorsIn(out);
  /* Both conditions. The count proves the gate reacted; the diagnostic proves
     the RIGHT guard reacted, which is what stops a deleted guard passing
     because a different one happened to fire. */
  const rose = errors > baseline;
  const named = out.includes(expect);
  if (rose && named) caught += 1;
  const verdict = rose && named ? 'CAUGHT ' : !rose ? 'MISSED ' : 'WRONG  ';
  console.log(`${verdict} ${name}  (errors ${baseline} -> ${errors}${rose && !named ? `, but never said "${expect}"` : ''})`);
}
if (existsSync(target)) unlinkSync(target);

console.log(`
${caught}/${names.length} constructs detected by the guard that owns them.`);
process.exit(caught === names.length ? 0 : 1);
