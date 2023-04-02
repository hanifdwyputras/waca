import {defineConfig} from 'tsup';

export default defineConfig({
    bundle: true,
    entry: ['./src/index.ts'],
    outDir: './dist',
    platform: 'node',
    target: ['esnext', 'node16', 'node18'],
    format: ['cjs'],
    clean: true,
    tsconfig: './tsconfig.json',
});
