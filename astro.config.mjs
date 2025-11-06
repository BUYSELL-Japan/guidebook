// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  build: {
    format: 'file'
  },
  // 🚨 修正箇所：末尾スラッシュを明示的に無視する
  trailingSlash: 'ignore'
});
