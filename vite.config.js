import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = process.cwd();

function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    writeBundle() {
      const outDir = resolve(root, 'dist');
      for (const dir of ['img', 'attaches', 'data']) {
        const from = resolve(root, dir);
        if (existsSync(from)) {
          cpSync(from, resolve(outDir, dir), { recursive: true, force: true });
        }
      }

      const cname = resolve(root, 'CNAME');
      if (existsSync(cname)) {
        mkdirSync(outDir, { recursive: true });
        copyFileSync(cname, resolve(outDir, 'CNAME'));
      }

      const indexHtml = resolve(outDir, 'index.html');
      if (existsSync(indexHtml)) {
        const html = readFileSync(indexHtml, 'utf8');
        for (const name of ['papers.html', 'projects.html', 'games.html', 'awards.html']) {
          writeFileSync(resolve(outDir, name), html);
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyStaticAssets()],
  base: '/',
  build: {
    rollupOptions: {
      input: resolve(root, 'index.html')
    }
  }
});
