import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://orangeoreo.com',
  integrations: [sitemap()],
  build: {
    assets: '_assets'
  }
});
