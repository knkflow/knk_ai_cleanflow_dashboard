import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['framer-motion', 'lucide-react'], // sicherstellen, dass Vite sie auflöst
  },
  ssr: {
    noExternal: ['framer-motion'], // hilft, wenn Vite im SSR/Preview-Modus läuft
  },
});
