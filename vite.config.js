// PURPOSE: Vite build configuration
// LAYER: Build tooling
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
