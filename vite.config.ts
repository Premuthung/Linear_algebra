import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative paths, so the built site works from any folder (GitHub Pages serves it from /<repo>/).
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
