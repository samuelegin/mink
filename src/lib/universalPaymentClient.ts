import { BrowserProvider, Signature, getBytes, type Eip1193Provider } from 'ethers'
import { CHAIN_ID, UA_TRANSACTION_STATUS } from '@particle-network/universal-account-sdk'
import { magic, getWalletAddress } from './magic'
import { getUniversalAccount } from './universalAccount'
import { getUserByHandle } from './api/users'
import type { PaymentClient, PaymentResult, ResolvedRecipient } from './paymentClient'

type Eip7702AuthField = { chainId: number; nonce: number; address: string }
type UserOpWithChain = {
  userOpHash: string
  eip7702Auth?: Eip7702AuthField
  eip7702Delegated?: boolean
}
type UaTransaction = {
  transactionId: string
  totalDepositTokenAmountInUSD: string
  rootHash: string
  userOps: UserOpWithChain[]
  gasless?: unknown
}
type Eip7702Authorization = { userOpHash: string; signature: string }

const SETTLEMENT_CHAIN_ID = CHAIN_ID.ARBITRUM_MAINNET_ONE
const SETTLEMENT_TOKEN_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

type TransferContext = {
  ownerAddress: string
  transaction: UaTransaction
}

function findEvmAddress(wallets: { chain: string; address: string; isPrimary: boolean }[]): string | null {
  const primary = wallets.find((w) => w.isPrimary)
  if (primary) return primary.address
  return wallets[0]?.address ?? null
}

async function getOwnerAddress(): Promise<string> {
  const info = await magic.user.getInfo()
  const address = getWalletAddress(info)
  if (!address) throw new Error('NO_WALLET')
  return address
}

async function getEthersSigner() {
  const provider = new BrowserProvider(magic.rpcProvider as unknown as Eip1193Provider)
  return provider.getSigner()
}

export const universalPaymentClient: PaymentClient = {
  async resolveHandle(handle): Promise<ResolvedRecipient> {
    const profile = await getUserByHandle(handle)
    const address = findEvmAddress(profile.wallets)
    if (!address) throw new Error('HandleNotFound: no wallet on file for that handle')
    return {
      handle: profile.handle || handle,
      name: profile.displayName ?? undefined,
      avatarUrl: profile.avatarUrl ?? undefined,
    }
  },

  async previewPayment({ handle, amount }) {
    const profile = await getUserByHandle(handle)
    const receiverAddress = findEvmAddress(profile.wallets)
    if (!receiverAddress) throw new Error('HandleNotFound: no wallet on file for that handle')

    const ownerAddress = await getOwnerAddress()
    const ua = getUniversalAccount(ownerAddress)

    const transaction = await ua.createTransferTransaction({
      token: { chainId: SETTLEMENT_CHAIN_ID, address: SETTLEMENT_TOKEN_ADDRESS },
      amount: amount.toFixed(2),
      receiver: receiverAddress,
    })

    const totalUsd = Number(transaction.totalDepositTokenAmountInUSD)
    const total = Number.isFinite(totalUsd) && totalUsd > 0 ? totalUsd : amount
    const networkFee = Math.max(0, total - amount)

    if (transaction.gasless) {
      console.log('[universalPaymentClient] gasless quote available:', transaction.gasless)
    }

    return {
      recipient: {
        handle: profile.handle || handle,
        name: profile.displayName ?? undefined,
        avatarUrl: profile.avatarUrl ?? undefined,
      },
      amount,
      asset: 'USDC',
      networkFee,
      total,
      sourceChain: 'Auto-routed from your balance',
      destinationChain: 'Arbitrum',
      estimatedArrival: 'Usually under a minute',
      _context: { ownerAddress, transaction } satisfies TransferContext,
    }
  },

  async executePayment(preview): Promise<PaymentResult> {
    const context = preview._context as TransferContext | undefined
    if (!context) throw new Error('Missing transaction — go back and try again.')
    const { ownerAddress, transaction } = context

    const ua = getUniversalAccount(ownerAddress)
    const authorizations: Eip7702Authorization[] = []
    for (const userOp of transaction.userOps) {
      if (userOp.eip7702Auth && !userOp.eip7702Delegated) {
        const magicAuth = await (magic as any).wallet.sign7702Authorization({
          contractAddress: userOp.eip7702Auth.address,
          chainId: userOp.eip7702Auth.chainId,
          nonce: userOp.eip7702Auth.nonce,
        })

        const serialized = Signature.from({
          r: magicAuth.r,
          s: magicAuth.s,
          v: magicAuth.v,
        }).serialized

        authorizations.push({ userOpHash: userOp.userOpHash, signature: serialized })
      }
    }

    const signer = await getEthersSigner()
    const signature = await signer.signMessage(getBytes(transaction.rootHash))

    const result = await ua.sendTransaction(
      transaction,
      signature,
      authorizations.length > 0 ? authorizations : undefined
    )

    return {
      transactionId: result?.transactionId ?? transaction.transactionId,
      status: 'pending',
    }
  },

  async getTransactionStatus(transactionId): Promise<PaymentResult> {
    const ownerAddress = await getOwnerAddress()
    const ua = getUniversalAccount(ownerAddress)
    const tx = await ua.getTransaction(transactionId)

    console.log('[universalPaymentClient] raw transaction status response:', tx)
    const rawStatus = tx?.status

    if (typeof rawStatus === 'number') {
      if (rawStatus === UA_TRANSACTION_STATUS.FINISHED) return { transactionId, status: 'completed' }
      if (
        rawStatus === UA_TRANSACTION_STATUS.EXECUTION_FAILED ||
        rawStatus === UA_TRANSACTION_STATUS.REFUND_FAILED
      ) {
        return { transactionId, status: 'failed' }
      }
      return { transactionId, status: 'pending' }
    }

    const statusStr = String(rawStatus ?? tx?.state ?? '').toLowerCase()
    if (statusStr.includes('finish') || statusStr.includes('success') || statusStr.includes('complete')) {
      return { transactionId, status: 'completed' }
    }
    if (statusStr.includes('fail') || statusStr.includes('error')) {
      return { transactionId, status: 'failed' }
    }
    return { transactionId, status: 'pending' }
  },
}