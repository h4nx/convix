import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { DEFAULT_THEME, STORAGE_KEY, THEME_IDS } from './src/lib/themes';

// Script de arranque inline: aplica el acento guardado en <html data-theme> antes del primer pintado.
// Los ids válidos salen de THEME_IDS para que añadir uno no rompa el arranque. Convix usa un único
// modo claro fijo (sin rama light/dark).
const THEME_BOOT_SCRIPT = `
(function(){
  var d = document.documentElement;
  try {
    var THEME_KEY = ${JSON.stringify(STORAGE_KEY)};
    var THEME_DEFAULT = ${JSON.stringify(DEFAULT_THEME)};
    var THEMES = ${JSON.stringify(THEME_IDS)};
    var savedTheme = localStorage.getItem(THEME_KEY);
    d.dataset.theme = THEMES.indexOf(savedTheme) !== -1 ? savedTheme : THEME_DEFAULT;
  } catch (_e) {
    d.dataset.theme = ${JSON.stringify(DEFAULT_THEME)};
  }
})();
`;

function themeBoot(): Plugin {
  return {
    name: 'convix-theme-boot',
    transformIndexHtml: (html) => html.replace('<!--theme-boot-->', `<script>${THEME_BOOT_SCRIPT}</script>`),
  };
}

const backend = `http://localhost:${process.env.BACKEND_PORT ?? 3001}`;

export default defineConfig({
  plugins: [react(), tailwindcss(), themeBoot()],
  resolve: { alias: { '@': resolve(__dirname, 'src'), '@server': resolve(__dirname, 'server') } },
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: true,
    // La API vive en el servidor Node (server/); en desarrollo se proxea por el mismo origen.
    proxy: { '/api': { target: backend, changeOrigin: false } },
  },
  build: { outDir: 'dist' },
});
