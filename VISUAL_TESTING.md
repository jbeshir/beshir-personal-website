# Visual testing

The visual journey follows the same screenshot-and-correctness-gate pattern as
the `beshir-widgets` journey harness. It renders the homepage, projects, blog,
archived summaries, and offline Tumblr preview across mobile/desktop and
light/dark cells.

```sh
npm run test:visual
```

The command builds both sites and writes full-page screenshots,
`visual-report.json`, and a `visual-ok` sentinel to `.visual-out/`. It fails on
browser console errors, page errors, or horizontal overflow. The output is
review evidence rather than a brittle pixel-perfect golden: intentional visual
changes do not require updating binary snapshots.
