// Offline preview harness for the Tumblr theme.
//
// Tumblr themes are a single HTML file full of {block:...}/{Var} template tags
// that only Tumblr's renderer expands. This script resolves those tags with
// representative sample fixtures (one of every post type, plus a tag-heavy post,
// a reblog trail, code, a permalink notes list and pagination), writes static
// pages to ./dist that load over file://, and copies the floral assets in beside
// them. Run: `node tumblr-theme/preview/render.mjs` from the repo root.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const distDir = resolve(here, 'dist');
const assetDir = resolve(distDir, 'assets');
mkdirSync(assetDir, { recursive: true });

// ── assets ────────────────────────────────────────────────────────────────
const copy = (from, to) => copyFileSync(from, resolve(assetDir, to));
copy(resolve(repoRoot, 'public/tumblr/corner-light.png'), 'corner-light.png');
copy(resolve(repoRoot, 'public/tumblr/corner-dark.png'), 'corner-dark.png');
copy(resolve(repoRoot, 'public/tumblr/divider-light.png'), 'divider-light.png');
copy(resolve(repoRoot, 'public/tumblr/divider-dark.png'), 'divider-dark.png');
copy(resolve(repoRoot, 'src/assets/avatar.png'), 'avatar.png');
copy(resolve(repoRoot, 'src/assets/projects/japanese-verb-tower-light.jpg'), 'photo.jpg');
copy(resolve(repoRoot, 'src/assets/projects/pennsic-planner-light.jpg'), 'photo2.jpg');

// ── theme CSS ───────────────────────────────────────────────────────────────
const theme = readFileSync(resolve(here, '../theme.html'), 'utf8');
const style = theme.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];

const css = style
  .replace(/\{color:Background\}/g, '#faf6f0')
  .replace(/\{color:Panel\}/g, '#fffdfa')
  .replace(/\{color:Text\}/g, '#20242b')
  .replace(/\{color:Muted\}/g, '#6b6358')
  .replace(/\{color:Accent\}/g, '#9d2235')
  .replace(/\{color:Border\}/g, '#c0ae94')
  .replace(/\{text:Corner Image Light\}/g, 'assets/corner-light.png')
  .replace(/\{text:Corner Image Dark\}/g, 'assets/corner-dark.png')
  .replace(/\{text:Divider Image Light\}/g, 'assets/divider-light.png')
  .replace(/\{text:Divider Image Dark\}/g, 'assets/divider-dark.png')
  .replace(/\{block:If[^}]*\}/g, '')
  .replace(/\{\/block:If[^}]*\}/g, '');

// ── fixtures ──────────────────────────────────────────────────────────────
const flowerMark = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><g fill="var(--accent)">
${[0,45,90,135,180,225,270,315].map(r => `<ellipse cx="16" cy="5.5" rx="2.2" ry="4.2" transform="rotate(${r} 16 16)"/>`).join('')}
</g><circle cx="16" cy="16" r="4.5" fill="var(--gold)"/></svg>`;

const foot = (extra = '') =>
  `<footer class="post-foot"><a href="#">3 hours ago</a><span class="dot">&middot;</span><a href="#">128 notes</a>${extra}</footer>`;

const tags = (...t) => `<div class="tags">${t.map(x => `<a class="tag" href="#">#${x}</a>`).join('')}</div>`;

const textPost = `<article class="post">
  <h2 class="post-title"><a href="#">Everything is complicated; let&rsquo;s try anyway</a></h2>
  <div class="post-body">
    <p>The standard objection to ambitious altruism is that the problems are too tangled to act on responsibly. That is true, and also not a reason to do nothing. Below is a longer run of body text so the measure, leading, and rhythm of Spectral can be judged at reading length on a parchment panel.</p>
    <h3>A sub-heading inside the post</h3>
    <p>Some considerations, with a <a href="#">link to a source</a> and a touch of <code>inline code</code> woven in:</p>
    <ul>
      <li>First, write the prediction down before you look.</li>
      <li>Then look, and score yourself honestly.</li>
      <li>Repeat until calibrated.</li>
    </ul>
    <blockquote><p>A reblogged remark from the trail sits in here, set off by a quiet rule rather than a heavy box, so the conversation reads as one column.</p></blockquote>
    <p>Back in the original voice, closing the thought. And a fenced block:</p>
    <pre><code>def calibrate(guess, outcome):
    return brier_score(guess, outcome)</code></pre>
  </div>
  ${foot()}
  ${tags('effective altruism','rationality','forecasting','epistemics')}
</article>`;

const tagHeavyPost = `<article class="post">
  <div class="post-body"><p>A short reblog with the kind of long tag list this blog actually uses.</p></div>
  ${foot('<span class="dot">&middot;</span>via <a href="#">someblog</a>')}
  ${tags('effective altruism','rationality','forecasting','meta','productivity','epistemics','worldbuilding','board games','long post','this one is a longer tag','calibration','musing')}
</article>`;

const photoPost = `<article class="post">
  <div class="post-media"><img src="assets/photo.jpg" alt="sample"></div>
  <div class="post-body post-caption"><p>A photo post caption, explaining what the image is and why it is worth a reblog.</p></div>
  ${foot()}
  ${tags('screenshots','projects')}
</article>`;

const photosetPost = `<article class="post">
  <div class="post-media"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><img src="assets/photo.jpg" alt=""><img src="assets/photo2.jpg" alt=""></div></div>
  <div class="post-body post-caption"><p>A photoset, two up.</p></div>
  ${foot()}
  ${tags('photoset')}
</article>`;

const quotePost = `<article class="post">
  <div class="quote-text">Everything is complicated; let&rsquo;s try anyway.</div>
  <div class="quote-source">a guiding principle</div>
  ${foot()}
  ${tags('quotes','aphorism')}
</article>`;

const linkPost = `<article class="post">
  <a class="post-link" href="#">A worldbuilding essay worth reblogging</a>
  <div class="post-body"><p>Short framing of why this link is here, in muted body text under the title.</p></div>
  ${foot()}
  ${tags('worldbuilding','links')}
</article>`;

const chatPost = `<article class="post">
  <h2 class="post-title"><a href="#">A short exchange</a></h2>
  <ul class="chat">
    <li class="odd"><span class="label">Them:</span>How do you stay calibrated?</li>
    <li class="even"><span class="label">Me:</span>Write the prediction down before you look.</li>
    <li class="odd"><span class="label">Them:</span>That&rsquo;s it?</li>
    <li class="even"><span class="label">Me:</span>Then look.</li>
  </ul>
  ${foot()}
  ${tags('chat')}
</article>`;

const answerPost = `<article class="post">
  <div class="qa-question"><div class="qa-asker"><b>anon</b> asked:</div>How do you decide what to work on?</div>
  <div class="post-body"><p>Expected value, mostly, plus whatever I can actually stick with.</p></div>
  ${foot()}
  ${tags('ask','answered')}
</article>`;

const pagination = `<nav class="pagination">
  <span class="current">1</span><a href="#">2</a><a href="#">3</a><a href="#">4</a><a href="#">5</a><a href="#">Older &rarr;</a>
</nav>`;

const sep = `<hr class="floral-sep" aria-hidden="true">`;

const header = `<header class="site-head">
  <a class="avatar" href="#"><img src="assets/avatar.png" alt="avatar"></a>
  <h1 class="site-title"><a href="#">Everything is Complicated, Let&rsquo;s Try Anyway</a></h1>
  <div class="description">Aspiring Effective Altruist and member of givingwhatwecan.org. Prediction Booker. Software developer. British. Mid thirties. EA and rationalist-adjacent stuff. I&rsquo;m also <a href="#">on Mastodon</a>.</div>
  <nav class="site-nav"><a href="#">Home</a><a href="#">Ask me anything</a><a href="#">Archive</a><a href="#">RSS</a></nav>
  <div class="head-rule" aria-hidden="true"></div>
</header>`;

const corners = `<div class="corner corner-l" aria-hidden="true"></div><div class="corner corner-r" aria-hidden="true"></div>`;

const noteList = `<div class="notes-wrap"><ol>
  ${Array.from({length:6}).map((_,i)=>`<li><img class="avatar" src="assets/avatar.png" alt="">someblog${i} reblogged this from jbeshir</li>`).join('')}
</ol></div>`;

const page = (bodyInner) =>
  `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body>${bodyInner}</body></html>`;

// index feed
const feed = [textPost, sep, quotePost, sep, photoPost, sep, linkPost, sep, tagHeavyPost, sep, photosetPost, sep, chatPost, sep, answerPost].join('\n');
const indexBody = `${corners}<div class="wrap">${header}<main>${feed}</main>${pagination}<footer class="site-foot">${flowerMark}<div>&copy; 2026 Everything is Complicated &middot; <a href="#">beshir.org</a></div></footer></div>`;

// permalink page (single post + notes)
const permaBody = `${corners}<div class="wrap">${header}<main>${textPost.replace('</article>', `${noteList}</article>`)}</main><footer class="site-foot">${flowerMark}<div>&copy; 2026 Everything is Complicated &middot; <a href="#">beshir.org</a></div></footer></div>`;

writeFileSync(resolve(distDir, 'index.html'), page(indexBody));
writeFileSync(resolve(distDir, 'permalink.html'), page(permaBody));
console.log('Wrote dist/index.html and dist/permalink.html with assets in dist/assets/');
