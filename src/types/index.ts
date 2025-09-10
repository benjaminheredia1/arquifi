export interface Lottery {
  id: number
  startTime: number
  endTime: number
  ticketPrice: string
  totalTickets: number
  totalPrize: string
  winningNumbers: number[]
  winners: string[]
  isActive: boolean
  isCompleted: boolean
}

// Ticket de Lotería (para el sorteo semanal)
export interface LotteryTicket {
  id: string
  lotteryId: number
  number: number // Número del 1-50
  owner: string
  purchaseTime: number
  isWinner: boolean
  price: number // 10 KOKI
}

// KoTicket (para rascar y ganar)
export interface KoTicket {
  id: string
  owner: string
  purchaseTime: number
  isScratched: boolean
  prizeAmount?: number // 1-10 KOKI
  scratchDate?: string
  price: number // 5 KOKI
}

// Alias para compatibilidad
export type Ticket = LotteryTicket

export interface User {
  id: string
  fid: number
  username: string
  email: string
  displayName: string
  pfpUrl: string
  address: string
  balance: string
  ticketsCount: number
  totalSpent: string
  joinedAt: string
  isVerified: boolean
}

export interface Transaction {
  id: string
  type: 'ticket_purchase' | 'prize_claim' | 'welcome_bonus'
  amount: string
  description: string
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
}

export interface FrameData {
  untrustedData: {
    fid: number
    url: string
    messageHash: string
    timestamp: number
    network: number
    buttonIndex: number
    castId: {
      fid: number
      hash: string
    }
  }
  trustedData: {
    messageBytes: string
  }
}

export interface FrameResponse {
  message: string
  data?: {
    type: 'success' | 'error' | 'info'
    requiresAuth?: boolean
    lottery?: Lottery
    tickets?: Ticket[]
    user?: User
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export interface LotteryStats {
  totalUsers: number
  totalTickets: number
  totalLotteries: number
  totalVolume: string
  activeUsers: number
}

export interface BuyTicketRequest {
  number: number
  userId: string
  username: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  avatar?: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    message: string
  }
  error?: string
}
