import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5174
	},
	optimizeDeps: {
		exclude: ['codemirror', '@codemirror/language-markdown' /* ... */]
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
