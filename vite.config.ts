import path from 'path';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { analyzer } from 'vite-bundle-analyzer';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    svgr(),
    tsconfigPaths(),
    {
      name: 'full-reload',
      handleHotUpdate({ file, server }) {
        if (/\.(scss|css)$/.test(file)) {
          server.ws.send({ type: 'full-reload' });
          return [];
        }
      },
    },
    // Bundle analyzer - only runs when ANALYZE env variable is set
    ...(process.env.ANALYZE === 'true' ? [analyzer()] : []),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // Use loadPaths instead of an absolute path inside the @use string.
        // Sass treats the @use argument as a URL, so absolute paths that contain
        // spaces or non-ASCII characters (e.g. "mods pizdec", a Cyrillic username)
        // fail to resolve. loadPaths takes a plain filesystem path which is safe.
        loadPaths: [path.join(process.cwd(), 'src')],
        additionalData: `@use "_mantine" as mantine;`,
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    proxy: {
      '^/api.*': 'http://localhost:8000',
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2200,
    rollupOptions: {
      onwarn(warning, warn) {
        const isSignalrPureAnnotationWarning =
          warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('@microsoft+signalr');

        if (isSignalrPureAnnotationWarning) {
          return;
        }

        warn(warning);
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom', 'react-redux'],
          'vendor-mantine': [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/notifications',
            '@mantine/modals',
            '@mantine/dropzone',
          ],
          'vendor-animation': ['framer-motion', 'gsap'],
          'vendor-mui-icons': ['@mui/icons-material'],
        },
      },
    },
  },
  ssr: {
    // Bundle all dependencies into the SSR bundle so Vite handles CJS→ESM
    // conversion for each package. This is appropriate for a build-time
    // prerender script (not a production server), where bundle size doesn't matter.
    noExternal: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
    css: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
});
