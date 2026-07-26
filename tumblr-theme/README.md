# Tumblr theme — *Everything is Complicated, Let's Try Anyway*

A custom theme for [jbeshir.tumblr.com](https://jbeshir.tumblr.com), styled to match
[beshir.org](https://beshir.org): warm parchment, rose-red accent, gold, Spectral serif,
rounded panel cards, and a floral motif drawn from the site's flower mark. Light and dark
modes follow the reader's OS via `prefers-color-scheme`.

## Files

- `theme.html` — the theme. Paste its full contents into Tumblr.
- Floral art lives in the site's public dir and is served from the live site:
  - `../public/tumblr/corner-light.png` / `corner-dark.png` — header corner sprays
  - `../public/tumblr/divider-light.png` / `divider-dark.png` — post dividers

  These are referenced as `https://beshir.org/tumblr/*.png`. **Deploy the website first**
  so those URLs are live, otherwise the flowers won't load.

## Install

1. Deploy beshir.org (so `https://beshir.org/tumblr/corner-light.png` etc. resolve).
2. Tumblr → **Edit appearance** → **Edit theme** → **Edit HTML**.
3. Replace everything with the contents of `theme.html` → **Update preview** → **Save**.

## Customise (Tumblr "Edit theme" sidebar)

The theme exposes options you can change without touching code:

| Option | Default | Notes |
|---|---|---|
| Background / Panel / Text / Muted / Accent / Border | brand palette | Light-mode colours. Dark mode uses a fixed matching set. |
| Show Avatar | on | Round avatar with accent ring, like the site homepage. |
| Show Corner Flowers | on | Fixed floral sprays top-left/right; auto-hidden below 900px. |
| Show Dividers | on | Floral ornament between posts and under the masthead. |
| Dark Mode Auto | on | Switches to the dark palette + dark art when the OS is dark. |
| Corner/Divider Image (Light/Dark) | beshir.org URLs | Point elsewhere to self-host the art. |

To make the corner sprays more subtle, lower their `opacity` or `width` in the
`.corner` rule; they are intentionally bold enough to frame the masthead.

## Supported post types

Text, Photo, Panorama, Photoset, Quote, Link, Chat, Audio, Video, and Answer (ask),
plus reblog attribution, tags as pill chips, post notes on permalink pages, and
numbered pagination.

## Regenerating the floral art

The PNGs were produced with the image-gen MCP (`gpt-image-2`), background-keyed and
compressed in a sandbox. The model bakes a checkerboard instead of true alpha, so the
pipeline keys out neutral near-white pixels, keeps the saturated florals and the darker
leaves, trims, downscales, and runs `pngquant`. Re-run that flow to refresh the art and
drop the results back into `../public/tumblr/`.
