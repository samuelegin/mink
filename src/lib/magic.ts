import { Magic } from 'magic-sdk'
import { OAuthExtension } from '@magic-ext/oauth2'

const PUBLISHABLE_KEY = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY as string

if (!PUBLISHABLE_KEY) {
  console.warn('VITE_MAGIC_PUBLISHABLE_KEY is not set — Magic login will fail until it is.')
}

export const ARBITRUM_SEPOLIA = {
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  chainId: 421614,
}

export const magic = new Magic(PUBLISHABLE_KEY, {
  network: ARBITRUM_SEPOLIA,
  extensions: [new OAuthExtension()],
})

export function getWalletAddress(info: {
  publicAddress?: string | null
  wallets?: { ethereum?: { publicAddress?: string | null } }
}) {
  return info.wallets?.ethereum?.publicAddress ?? info.publicAddress ?? null
}
