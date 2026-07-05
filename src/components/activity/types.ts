export type ActivityStatus = 'completed' | 'pending' | 'failed' | 'cancelled'
export type ActivityKind = 'received' | 'sent'

export type ActivityEntry = {
  id: string
  kind: ActivityKind
  status: ActivityStatus
  counterpartyHandle: string
  counterpartyName?: string
  avatarUrl?: string
  amount: number
  message?: string
  timestamp: string 
}