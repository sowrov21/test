import { defineConfig } from 'vite';
import inject from '@rollup/plugin-inject';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production';

  return {
    base: './',
    server: { port: 5173 },
    optimizeDeps: { include: ['jquery'] },
    plugins: [
      inject({ $: 'jquery', jQuery: 'jquery', 'window.$': 'jquery', 'window.jQuery': 'jquery' }),
      isProd && removeConsole({ includes: ['log'] }),
    ],
    build: {
      minify: isProd ? 'terser' : 'esbuild',
      esbuild: {
        pure: isProd ? ['console.log'] : [],
      },
      terserOptions: isProd
        ? { compress: { drop_console: true, drop_debugger: true } }
        : {},
      outDir: isProd ? 'dist' : 'dist-dev',
      sourcemap: !isProd,
    },
  };
});
