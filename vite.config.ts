import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = Number(process.env.BABYFLOW_API_PORT ?? 8787);

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/cycle-events': `http://127.0.0.1:${apiPort}`,
      '/feed-sessions': `http://127.0.0.1:${apiPort}`,
      '/interventions': `http://127.0.0.1:${apiPort}`,
      '/babies': `http://127.0.0.1:${apiPort}`,
      '/baby-state-transitions': `http://127.0.0.1:${apiPort}`,
      '/timeline-clusters': `http://127.0.0.1:${apiPort}`,
      '/health': `http://127.0.0.1:${apiPort}`
    }
  },

  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**', '**/worker-runtime.test.ts']
  }
});
