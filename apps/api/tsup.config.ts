import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  splitting: false,
  // Bundle workspace packages inline (pure TS, no native deps)
  noExternal: [/@erp\/.*/],
  // Keep Prisma external — it needs native Node.js require()
  external: [
    '@prisma/client',
    '.prisma/client',
    '.prisma',
  ],
  esbuildOptions(options) {
    // Resolve workspace TS source directly
    options.alias = {
      '@erp/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
      '@erp/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@erp/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@erp/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts'),
    };
  },
});
