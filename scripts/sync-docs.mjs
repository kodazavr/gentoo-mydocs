import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(root);
const docsRoot = join(projectRoot, 'src', 'content', 'docs');
const publicScreenshots = join(projectRoot, 'public', 'screenshots');
const sourceDirectories = [
  'desktop',
  'experiments',
  'filesystem',
  'hardware',
  'installation',
  'managed',
  'networking',
  'security',
  'settings',
  'systems',
  'troubleshooting',
];
const rootDocuments = [
  'CONTRIBUTING.md',
  'DOCUMENTATION_INVENTORY.md',
  'DOCUMENTATION_POLICY.md',
  'README.md',
];

await rm(docsRoot, { recursive: true, force: true });
await mkdir(docsRoot, { recursive: true });

for (const directory of sourceDirectories) {
  await cp(join(projectRoot, directory), join(docsRoot, directory), {
    recursive: true,
  });
}

for (const document of rootDocuments) {
  const target = {
    'README.md': 'index.md',
    'CONTRIBUTING.md': 'contributing.md',
    'DOCUMENTATION_INVENTORY.md': 'documentation-inventory.md',
    'DOCUMENTATION_POLICY.md': 'documentation-policy.md',
  }[document];
  await cp(join(projectRoot, document), join(docsRoot, target));
}

async function addTitles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await addTitles(entryPath);
      continue;
    }
    if (!entry.name.endsWith('.md')) continue;

    const content = await readFile(entryPath, 'utf8');
    if (!/^---\r?\n/.test(content) || /^title:/m.test(content)) continue;
    const heading = content.match(/^#\s+(.+)$/m);
    const title = heading?.[1]?.trim() ?? entry.name.replace(/\.md$/, '');
    await writeFile(
      entryPath,
      content.replace(/^---\r?\n/, (match) => `${match}title: ${JSON.stringify(title)}\n`),
    );
  }
}

await addTitles(docsRoot);

const screenshots = join(projectRoot, 'screenshots');
const screenshotEntries = await readdir(screenshots).catch(() => []);
if (screenshotEntries.length > 0) {
  await rm(publicScreenshots, { recursive: true, force: true });
  await cp(screenshots, publicScreenshots, { recursive: true });
  const indexPath = join(docsRoot, 'index.md');
  const indexContent = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, indexContent.replaceAll('](screenshots/', '](/screenshots/'));
} else {
  const indexPath = join(docsRoot, 'index.md');
  const indexContent = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, indexContent.replace(/^.*screenshots\/.*\r?\n?/gm, ''));
}