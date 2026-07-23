import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, process.env.VISUAL_OUT ?? '.visual-out');
const siteRoot = resolve(root, 'dist');
const tumblrRoot = resolve(root, 'tumblr-theme/preview/dist');

const surfaces = [
  { name: 'home', root: siteRoot, path: '/' },
  { name: 'projects', root: siteRoot, path: '/projects/' },
  { name: 'blog', root: siteRoot, path: '/blog/' },
  { name: 'tumblr', root: tumblrRoot, path: '/' },
];
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];
const schemes = ['light', 'dark'];

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function serve(directory) {
  return createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requested = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let filename = join(directory, requested);
    if (pathname.endsWith('/')) filename = join(filename, 'index.html');
    if (!existsSync(filename) && !extname(filename)) filename = join(filename, 'index.html');

    const relativeFilename = relative(directory, filename);
    if (relativeFilename.startsWith('..') || relativeFilename.includes(':') || !existsSync(filename)) {
      response.writeHead(404).end('Not found');
      return;
    }

    response.setHeader('Content-Type', contentTypes.get(extname(filename)) ?? 'application/octet-stream');
    createReadStream(filename).pipe(response);
  });
}

async function listen(server) {
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  return server.address().port;
}

mkdirSync(output, { recursive: true });
const siteServer = serve(siteRoot);
const tumblrServer = serve(tumblrRoot);
const sitePort = await listen(siteServer);
const tumblrPort = await listen(tumblrServer);
const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const report = { cells: [] };
let failures = 0;

try {
  for (const surface of surfaces) {
    for (const viewport of viewports) {
      for (const scheme of schemes) {
        const context = await browser.newContext({
          colorScheme: scheme,
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
          viewport,
        });
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        page.on('console', (message) => {
          if (message.type() === 'error') consoleErrors.push(message.text());
        });
        page.on('pageerror', (error) => pageErrors.push(error.message));

        const port = surface.root === tumblrRoot ? tumblrPort : sitePort;
        const url = `http://127.0.0.1:${port}${surface.path}`;
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({
          content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
        });

        const overflow = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        const screenshot = `${surface.name}__${viewport.name}__${scheme}.png`;
        await page.screenshot({ path: join(output, screenshot), fullPage: true });

        const failed = consoleErrors.length > 0 || pageErrors.length > 0 || overflow.scrollWidth > overflow.clientWidth;
        if (failed) failures += 1;
        report.cells.push({
          surface: surface.name,
          viewport,
          scheme,
          screenshot,
          consoleErrors,
          pageErrors,
          overflow,
          status: failed ? 'failed' : 'passed',
        });
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  await Promise.all([
    new Promise((resolveClose) => siteServer.close(resolveClose)),
    new Promise((resolveClose) => tumblrServer.close(resolveClose)),
  ]);
}

writeFileSync(join(output, 'visual-report.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(output, 'visual-ok'), failures === 0 ? 'ok\n' : 'fail\n');

if (failures > 0) {
  console.error(`visual journey failed: ${failures} problem cell(s); see ${output}`);
  process.exit(1);
}

console.log(`visual journey passed: ${report.cells.length} cells; screenshots and report in ${output}`);
