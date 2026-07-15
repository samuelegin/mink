import { BrowserProvider, Contract, JsonRpcProvider, parseUnits, type Eip1193Provider } from 'ethers'
import { magic, ARBITRUM_SEPOLIA } from './magic'

// PaymentRegistry is deployed on Arbitrum Sepolia — deliberately decoupled
// from the UA settlement chain (Arbitrum One mainnet). A receipt log is
// supplementary proof-of-payment, not the payment itself, so it runs on the
// free/cheap testnet rather than spending real mainnet gas on every send.
// The EOA needs a small amount of Arbitrum Sepolia faucet ETH to cover
// logPayment() gas — separate from the real USDC used for UA settlement.
export const PAYMENT_REGISTRY_ADDRESS = import.meta.env.VITE_PAYMENT_REGISTRY_ADDRESS as string

if (!PAYMENT_REGISTRY_ADDRESS) {
  console.warn(
    'VITE_PAYMENT_REGISTRY_ADDRESS is not set — on-chain receipt logging will fail until PaymentRegistry.sol is deployed and the address is added to .env.'
  )
}

export const PAYMENT_REGISTRY_ABI = [
  'function logPayment(address to, uint256 amount, string fromHandle, string toHandle, string note)',
  'function getStats(address account) view returns (tuple(uint256 totalSentWei, uint256 totalReceivedWei, uint256 sentCount, uint256 receivedCount))',
  'function totalPayments() view returns (uint256)',
  'function totalVolumeWei() view returns (uint256)',
  'error ZeroAmount()',
  'error ZeroAddress()',
]

const readProvider = new JsonRpcProvider(ARBITRUM_SEPOLIA.rpcUrl)

export function getReadContract() {
  return new Contract(PAYMENT_REGISTRY_ADDRESS, PAYMENT_REGISTRY_ABI, readProvider)
}

export async function getWriteContract() {
  const provider = new BrowserProvider(magic.rpcProvider as unknown as Eip1193Provider)
  const signer = await provider.getSigner()
  return new Contract(PAYMENT_REGISTRY_ADDRESS, PAYMENT_REGISTRY_ABI, signer)
}

export type LogPaymentResult = { ok: true; txHash: string } | { ok: false; error: unknown }

/**
 * Fire-and-forget on-chain receipt log, called after a UA payment has
 * already settled. Deliberately never throws — the real transfer already
 * happened by the time this runs, so a logging failure must never surface
 * as a failed payment to the user. Callers can still inspect the returned
 * `ok` flag if they want to show a subtle "receipt pending" indicator.
 */
export async function logPaymentReceipt(params: {
  to: string
  amountUsd: number
  fromHandle: string
  toHandle: string
  note: string
}): Promise<LogPaymentResult> {
  try {
    const contract = await getWriteContract()
    // USDC has 6 decimals; this stores the USD amount sent as a record, not
    // a token transfer, so 6dp keeps it consistent with the settlement asset.
    const amount = parseUnits(params.amountUsd.toFixed(2), 6)
    const tx = await contract.logPayment(params.to, amount, params.fromHandle, params.toHandle, params.note || '')
    const receipt = await tx.wait()
    return { ok: true, txHash: receipt?.hash ?? tx.hash }
  } catch (error) {
    console.warn('[PaymentRegistry] logPayment failed — the payment itself already settled and is unaffected:', error)
    return { ok: false, error }
  }
}

export function decodeRegistryError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  if (message.includes('ZeroAmount')) return 'Amount must be greater than zero.'
  if (message.includes('ZeroAddress')) return 'Recipient address is invalid.'
  if (message.includes('user rejected') || message.includes('User denied')) return 'Cancelled — try again.'
  return 'Could not log this payment on-chain.'
}
