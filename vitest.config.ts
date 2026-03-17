import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/types/**',
        'src/lib/supabase.ts',
        'src/contexts/AuthContext.tsx',
        'src/hooks/useRealtimeChannel.ts',
        'src/hooks/usePresence.ts',
        'src/hooks/useVoteChanges.ts',
        'src/hooks/useBroadcast.ts',
        'src/hooks/useConnectionStatus.ts',
        'src/pages/HomePage.tsx',
        'src/pages/SessionPage.tsx',
      ],
    },
  },
})
