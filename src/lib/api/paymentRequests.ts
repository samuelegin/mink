import { apiRequest as request } from './client'
import { extractList } from './listHelpers'

export type PaymentRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired'

export type PaymentRequestItem = {
  id: string
  counterpartyId: string
  counterpartyHandle: string
  counterpartyDisplayName: string | null
  counterpartyAvatarUrl: string | null
  amount: number
  currency: string
  note: string | null
  status: PaymentRequestStatus
  createdAt: string
  expiresAt: string | null
}

// UNVERIFIED SHAPE — no response_model declared. Assumed the payer/requester's
// handle + display name are embedded on the request object; if the API only
// returns raw user ids, this needs a follow-up lookup via getUserByHandle/users/{id}.
function adaptPaymentRequest(raw: Record<string, unknown>): PaymentRequestItem {
  return {
    id: String(raw.id ?? ''),
    counterpartyId: String(raw.payer_id ?? raw.requester_id ?? raw.counterparty_id ?? ''),
    counterpartyHandle: String(raw.handle ?? raw.counterparty_handle ?? ''),
    counterpartyDisplayName: (raw.display_name as string | undefined) ?? null,
    counterpartyAvatarUrl: (raw.avatar_url as string | undefined) ?? null,
    amount: Number(raw.amount ?? 0),
    currency: String(raw.currency ?? 'USD'),
    note: (raw.note as string | undefined) ?? null,
    status: (raw.status as PaymentRequestStatus | undefined) ?? 'pending',
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    expiresAt: (raw.expires_at as string | undefined) ?? null,
  }
}

export async function createPaymentRequest(params: {
  payerId: string
  amount: number
  currency?: string
  note?: string
  expiresAt?: string
}): Promise<PaymentRequestItem> {
  const raw = await request<Record<string, unknown>>('/api/v1/payment-requests', {
    method: 'POST',
    body: {
      payer_id: params.payerId,
      amount: params.amount,
      currency: params.currency ?? 'USD',
      note: params.note,
      expires_at: params.expiresAt,
    },
  })
  return adaptPaymentRequest(raw)
}

export async function listIncomingPaymentRequests(): Promise<PaymentRequestItem[]> {
  const raw = await request<unknown>('/api/v1/payment-requests/incoming')
  return extractList(raw).map(adaptPaymentRequest)
}

export async function listOutgoingPaymentRequests(): Promise<PaymentRequestItem[]> {
  const raw = await request<unknown>('/api/v1/payment-requests/outgoing')
  return extractList(raw).map(adaptPaymentRequest)
}

export async function acceptPaymentRequest(requestId: string): Promise<void> {
  await request(`/api/v1/payment-requests/${encodeURIComponent(requestId)}/accept`, { method: 'POST' })
}

export async function rejectPaymentRequest(requestId: string): Promise<void> {
  await request(`/api/v1/payment-requests/${encodeURIComponent(requestId)}/reject`, { method: 'POST' })
}

export async function cancelPaymentRequest(requestId: string): Promise<void> {
  await request(`/api/v1/payment-requests/${encodeURIComponent(requestId)}/cancel`, { method: 'POST' })
}

export async function remindPaymentRequest(requestId: string): Promise<void> {
  await request(`/api/v1/payment-requests/${encodeURIComponent(requestId)}/remind`, { method: 'POST' })
}

