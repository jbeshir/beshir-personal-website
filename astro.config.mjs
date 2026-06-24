import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://beshir.org/',
  integrations: [
    react(),
    // Keep per-project privacy policies out of the sitemap — they are reachable
    // by direct URL (for extension store listings) but intentionally unlisted.
    sitemap({ filter: (page) => !page.includes('/privacy/') }),
    mdx(),
  ],
  redirects: {
    '/technical': '/blog',
    '/technical/inoculation-against-architecture-fads': '/blog/inoculation-against-architecture-fads',
    '/technical/nushell-and-exporting-data': '/blog/nushell-and-exporting-data',
    '/technical/request-volume-and-size-are-part-of-the-contract': '/blog/request-volume-and-size-are-part-of-the-contract',
    '/technical/transformer-lens-transformer-from-scratch': '/blog/transformer-lens-transformer-from-scratch',
  }
});
