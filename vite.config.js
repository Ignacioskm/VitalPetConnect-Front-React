import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/configTest.js', // <--- Apunta a tu archivo existente
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Mantiene la misma estructura de carpetas del reporte (api, components,
      // context, data, hooks) y deja fuera los propios archivos de prueba.
      include: [
        'src/api/**/*.{js,jsx}',
        'src/components/**/*.{js,jsx}',
        'src/context/**/*.{js,jsx}',
        'src/data/**/*.{js,jsx}',
        'src/hooks/**/*.{js,jsx}',
      ],
      exclude: ['src/tests/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});