export type ResolvedRecipient = {
  handle: string
  name?: string
  avatarUrl?: string
}

export type PaymentPreview = {
  recipient: ResolvedRecipient
  amount: number
  asset: string
  networkFee: number
  total: number
  sourceChain: string
  destinationChain: string
  estimatedArrival: string
}

export type PaymentResult = {
  transactionId: string
  status: 'completed' | 'pending' | 'failed'
}

export type PaymentClient = {
  resolveHandle: (handle: string) => Promise<ResolvedRecipient>
  previewPayment: (params: { handle: string; amount: number; note?: string }) => Promise<PaymentPreview>
  executePayment: (preview: PaymentPreview, note?: string) => Promise<PaymentResult>
  getTransactionStatus: (transactionId: string) => Promise<PaymentResult>
}

// Mock implementation. Swap this for a real HTTP-backed client once a backend exists.
// Every UI component consumes only the PaymentClient interface above, so that swap
// requires no changes anywhere else in the payment flow.
export const mockPaymentClient: PaymentClient = {
  async resolveHandle(handle) {
    await new Promise((r) => setTimeout(r, 350))
    return { handle }
  },

  async previewPayment({ handle, amount, note }) {
    await new Promise((r) => setTimeout(r, 500))
    void note
    return {
      recipient: { handle },
      amount,
      asset: 'USD',
      networkFee: 0,
      total: amount,
      sourceChain: 'Arbitrum',
      destinationChain: 'Arbitrum',
      estimatedArrival: 'Instant',
    }
  },

  async executePayment(preview) {
    await new Promise((r) => setTimeout(r, 1200))
    // Simulated 6% random failure rate so the error state is reachable during testing.
    if (Math.random() < 0.06) {
      throw new Error('NETWORK_CONGESTED')
    }
    void preview
    return {
      transactionId: `mock_${Date.now()}`,
      status: 'completed',
    }
  },

  async getTransactionStatus(transactionId) {
    await new Promise((r) => setTimeout(r, 200))
    return { transactionId, status: 'completed' }
  },
}

export function friendlyPaymentError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  if (message.includes('NETWORK_CONGESTED')) return "The network's a little busy right now."
  if (message.includes('INSUFFICIENT')) return "You don't have enough balance for this payment."
  if (message.includes('HandleNotFound')) return "We couldn't find that handle."
  return 'Something went wrong on our end.'
}
