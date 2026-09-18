import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Vite (vanilla) compiles Tailwind at build time, bundles the ES modules and
// injects the VITE_* environment variables read by src/config.js.
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  preview: {
    port: 4173,
  },
});
