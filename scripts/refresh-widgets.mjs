/**
 * Regenerates src/data/widgets.json from the beshir-widgets monorepo.
 *
 * Usage: node scripts/refresh-widgets.mjs [widgetsRepo]
 *   widgetsRepo  path to the beshir-widgets checkout (default: ../beshir-widgets)
 *
 * Run from repo root. The widgets repo is read ONLY at dev time — the
 * build never depends on it.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const widgetsRepo = resolve(process.cwd(), process.argv[2] ?? '../beshir-widgets');
const widgetsDir = join(widgetsRepo, 'widgets');

const dirs = readdirSync(widgetsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const entries = [];

for (const slug of dirs) {
  const widgetJsonPath = join(widgetsDir, slug, 'widget.json');
  if (!existsSync(widgetJsonPath)) continue;

  const data = JSON.parse(readFileSync(widgetJsonPath, 'utf8'));

  const url = `https://${data.hostname}`;

  let embedHeight = 600;
  const iframe = data.embeddable?.recommendedIframe ?? '';
  const match = iframe.match(/height:\s*(\d+)px/);
  if (match) embedHeight = parseInt(match[1], 10);

  entries.push({
    slug: data.slug ?? slug,
    title: data.title,
    description: data.description,
    url,
    embedHeight,
  });
}

const FIRST = ['japanese-verb-tower', 'pennsic-planner'];

entries.sort((a, b) => {
  const ai = FIRST.indexOf(a.slug);
  const bi = FIRST.indexOf(b.slug);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.slug.localeCompare(b.slug);
});

const outPath = resolve(process.cwd(), 'src/data/widgets.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n');

console.log(`Wrote ${outPath}`);
for (const e of entries) {
  console.log(`  ${e.slug} -> ${e.url} (height ${e.embedHeight}px)`);
}
