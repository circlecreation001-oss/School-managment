import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  splitting: false,
  // Bundle workspace packages inline (they only have TS source)
  noExternal: [/@erp\/.*/],
  // Keep Prisma and all native/Node packages external
  external: [
    '@prisma/client',
    '@prisma/engines',
    '.prisma/client',
    'prisma',
  ],
  // Resolve workspace package source files directly
  esbuildOptions(options) {
    options.alias = {
      '@erp/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
      '@erp/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@erp/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@erp/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts'),
    };
  },
});
