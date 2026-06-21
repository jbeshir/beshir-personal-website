import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://beshir.org/',
  integrations: [react(), sitemap()],
  redirects: {
    '/technical': '/blog',
    '/technical/inoculation-against-architecture-fads': '/blog/inoculation-against-architecture-fads',
    '/technical/nushell-and-exporting-data': '/blog/nushell-and-exporting-data',
    '/technical/request-volume-and-size-are-part-of-the-contract': '/blog/request-volume-and-size-are-part-of-the-contract',
    '/technical/transformer-lens-transformer-from-scratch': '/blog/transformer-lens-transformer-from-scratch',
  }
});
