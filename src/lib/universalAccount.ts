import { UniversalAccount } from '@particle-network/universal-account-sdk'

// The SDK's own declarations aren't reachable through its package.json
// "exports" map (see src/types/particle-universal-account-sdk.d.ts), so we
// keep our own minimal shapes for the bits of the response we actually use.
type SmartAccountOptions = {
  ownerAddress: string
  name: string
  version: string
  smartAccountAddress?: string
  solanaSmartAccountAddress?: string
  useEIP7702?: boolean
}

type PrimaryAssetsResponse = {
  assets: unknown[]
  totalAmountInUSD: number
}

const PROJECT_ID = import.meta.env.VITE_PARTICLE_PROJECT_ID as string
const CLIENT_KEY = import.meta.env.VITE_PARTICLE_CLIENT_KEY as string
const APP_ID = import.meta.env.VITE_PARTICLE_APP_ID as string

if (!PROJECT_ID || !CLIENT_KEY || !APP_ID) {
  console.warn(
    'VITE_PARTICLE_PROJECT_ID / VITE_PARTICLE_CLIENT_KEY / VITE_PARTICLE_APP_ID are not set — ' +
      'Universal Account features will fail until they are configured in .env.'
  )
}

// One UniversalAccount instance per owner address (the Magic-created EOA).
// Re-created if a different address logs in.
let cached: { ownerAddress: string; account: InstanceType<typeof UniversalAccount> } | null = null

export function getUniversalAccount(ownerAddress: string): InstanceType<typeof UniversalAccount> {
  if (cached && cached.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()) {
    return cached.account
  }

  const account = new UniversalAccount({
    projectId: PROJECT_ID,
    projectClientKey: CLIENT_KEY,
    projectAppUuid: APP_ID,
    smartAccountOptions: {
      // EIP-7702 mode: the Magic EOA itself becomes the Universal Account.
      // No new address, no asset migration.
      useEIP7702: true,
      ownerAddress,
    },
  })

  cached = { ownerAddress, account }
  return account
}

// Step 1 check: resolve the Universal Account's own view of itself for this
// owner. Read-only — does not move funds or require any signature from the
// user. Useful to confirm the SDK + dashboard credentials are wired correctly.
export async function resolveUniversalAccount(ownerAddress: string): Promise<SmartAccountOptions> {
  const ua = getUniversalAccount(ownerAddress)
  return ua.getSmartAccountOptions()
}

// Step 1/2 check: read the unified balance across all supported chains for
// this Universal Account. Also read-only.
export async function getUniversalAccountAssets(ownerAddress: string): Promise<PrimaryAssetsResponse> {
  const ua = getUniversalAccount(ownerAddress)
  return ua.getPrimaryAssets()
}
