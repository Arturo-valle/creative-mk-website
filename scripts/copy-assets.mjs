import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

const publicEntries = [
  'contact.html',
  'robots.txt',
  'lp',
  '_headers',
  'favicon.png',
  'css',
  'js',
  'images',
  'Logos',
  'video',
  'contact-assets',
  'admin'
];

const forbiddenTopLevelEntries = new Set([
  'contact-src',
  'scripts',
  'node_modules',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js'
]);

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

async function copyPublicEntry(entryName) {
  const source = join(root, entryName);
  const target = join(distDir, entryName);

  if (!existsSync(source)) {
    throw new Error(`Missing required public entry: ${entryName}`);
  }

  const sourceStats = await stat(source);
  if (sourceStats.isDirectory()) {
    await copyDirectory(source, target);
    return;
  }

  await mkdir(dirname(target), { recursive: true });
  await cp(source, target);
}

async function copyDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });

  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('_')) continue;

    const source = join(sourceDir, entry.name);
    const target = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(source, target);
    } else if (entry.isFile()) {
      await mkdir(dirname(target), { recursive: true });
      await cp(source, target);
    }
  }
}

for (const entry of publicEntries) {
  await copyPublicEntry(entry);
}

