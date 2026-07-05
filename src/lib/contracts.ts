import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers'
import { magic, ARBITRUM_SEPOLIA } from './magic'

export const HANDLE_REGISTRY_ADDRESS = '0x69243Fdc5a876cd0cfb3f133671Bbe6097ABB1B3'

export const HANDLE_REGISTRY_ABI = [
  'function registerHandle(string handle)',
  'function setAddress(string handle, address newOwner)',
  'function resolve(string handle) view returns (address)',
  'function handleOf(address account) view returns (string)',
  'function isAvailable(string handle) view returns (bool)',
  'error HandleTaken()',
  'error HandleNotFound()',
  'error NotHandleOwner()',
  'error AlreadyHasHandle()',
  'error InvalidHandle()',
]

const readProvider = new JsonRpcProvider(ARBITRUM_SEPOLIA.rpcUrl)

export function getReadContract() {
  return new Contract(HANDLE_REGISTRY_ADDRESS, HANDLE_REGISTRY_ABI, readProvider)
}

export async function getWriteContract() {
  const provider = new BrowserProvider(magic.rpcProvider as unknown as import('ethers').Eip1193Provider)
  const signer = await provider.getSigner()
  return new Contract(HANDLE_REGISTRY_ADDRESS, HANDLE_REGISTRY_ABI, signer)
}

export function decodeRegistryError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  if (message.includes('HandleTaken')) return 'That handle was just taken — try another.'
  if (message.includes('AlreadyHasHandle')) return 'This wallet already owns a handle.'
  if (message.includes('InvalidHandle')) return 'Handles must be 1–32 characters.'
  if (message.includes('user rejected') || message.includes('User denied')) return 'Cancelled — try again.'
  return 'Something went wrong claiming that handle. Try again.'
}
