import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    // @particle-network/universal-account-sdk pulls in @solana/web3.js,
    // which expects Node's `process`/`Buffer` globals. Vite doesn't
    // polyfill these for the browser by default, causing
    // "ReferenceError: process is not defined" at runtime when the
    // Universal Account resolution actually runs.
    nodePolyfills({
      include: ['process', 'buffer'],
    }),
    react(),
    tailwindcss(),
  ],
})