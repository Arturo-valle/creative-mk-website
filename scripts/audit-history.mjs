/**
 * One line per build into docs/audit-history.csv.
 *
 * .audit.json is gitignored and dist/ is disposable, so until now the only
 * time series for the site's scores was the status headers of the docs and
 * the git log — the 87.2 frozen in content-audit-2026-08-16.md sat beside a
 * live 87.7 with nothing recording when the number moved. This file is the
 * record: appended by the build after audit.mjs emits, versioned with the
 * repo, and deduplicated so re-running verify on an unchanged tree adds
 * nothing.
 *
 * Columns: date, commit (short hash, "+" when the tree is dirty), siteScore,
 * pages scored, technical findings by severity.
 */

import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const auditPath = join(root, '.audit.json');
const csvPath = join(root, 'docs', 'audit-history.csv');

if (!existsSync(auditPath)) {
  console.error('.audit.json not found — run `node scripts/audit.mjs --emit .audit.json` first.');
  process.exit(1);
}

const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const severities = { high: 0, medium: 0, low: 0 };
for (const finding of audit.technical ?? []) {
  if (finding.severity in severities) severities[finding.severity] += 1;
}

let commit = 'unknown';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
  if (execSync('git status --porcelain', { cwd: root }).toString().trim()) commit += '+';
} catch {
  // Not a git checkout (CI tarball, extracted archive): the row still records.
}

const date = new Date().toISOString().slice(0, 10);
const row = [date, commit, audit.siteScore, audit.pages?.length ?? 0, severities.high, severities.medium, severities.low];

const HEADER = 'date,commit,siteScore,pages,high,medium,low';
if (!existsSync(csvPath)) {
  await writeFile(csvPath, HEADER + '\n');
}

/* Same measurement twice is one fact, not two rows. Only the date may differ:
   a verify re-run tomorrow on an identical tree still adds nothing. */
const lines = (await readFile(csvPath, 'utf8')).trimEnd().split('\n');
const last = lines[lines.length - 1].split(',');
const unchanged =
  last.length === row.length && last.slice(1).join(',') === row.slice(1).join(',');

if (unchanged) {
  console.log(`audit-history: unchanged (${audit.siteScore} @ ${commit}), no row added.`);
} else {
  await appendFile(csvPath, row.join(',') + '\n');
  console.log(`audit-history: recorded ${audit.siteScore} @ ${commit} (${lines.length} rows).`);
}
