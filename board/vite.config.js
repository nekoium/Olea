import { defineConfig } from 'vite';
import { cpSync, mkdirSync } from 'node:fs';

// Keep Excalidraw's fonts local, including fonts used by imported drawings.
mkdirSync(new URL('./.assets/', import.meta.url), {recursive:true});
cpSync(new URL('./node_modules/@excalidraw/excalidraw/dist/prod/fonts/', import.meta.url),
  new URL('./.assets/fonts/', import.meta.url), {recursive:true});

export default defineConfig({
  publicDir: '.assets',
  build: {rollupOptions:{input:['app.html','index.html']}},
});
