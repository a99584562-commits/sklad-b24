import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages repo path: a99584562-commits.github.io/sklad-b24/
export default defineConfig({
  base: '/sklad-b24/',
  plugins: [react()],
})
