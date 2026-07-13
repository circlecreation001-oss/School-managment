import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  splitting: false,
  // Bundle all workspace packages inline so the output is self-contained
  noExternal: [/@erp\/.*/],
  // Resolve workspace package source files
  esbuildOptions(options) {
    options.alias = {
      '@erp/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
      '@erp/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@erp/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@erp/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts'),
    };
  },
});
