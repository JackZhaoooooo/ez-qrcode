import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import semi from 'vite-plugin-semi-theme'

export default defineConfig({
	plugins: [
		react(),
		semi({
			theme: '@douyinfe/semi-theme-default',
			options: { cssLayer: true },
		}),
	],
	base: './',
	server: {
		port: 5173,
		strictPort: true,
		hmr: {
			port: 5173,
		},
	},
	build: {
		outDir: 'dist',
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
})
