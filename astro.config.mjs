// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mop-okinawa.com',
  output: 'static',
  build: {
    format: 'file'
  },
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      serialize(item) {
        return item;
      },
      customPages: [],
      filter: (page) => true,
    })
  ]
});
