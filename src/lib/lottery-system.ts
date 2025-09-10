// Sistema de Lotería KoquiFI - Diseñado para confianza y simplicidad

export interface LotteryConfig {
  maxUsers: number // Límite de 1-50 usuarios
  maxTicketsPerUser: number // Máximo 5 tickets por usuario
  ticketPrice: number // 10 KOKI por ticket
  weeklySchedule: boolean // Sorteos semanales
  transparencyMode: boolean // Modo de transparencia total
}

export const LOTTERY_CONFIG: LotteryConfig = {
  maxUsers: 50, // Límite de usuarios para generar exclusividad
  maxTicketsPerUser: 999, // Sin límite de tickets por usuario
  ticketPrice: 10, // Precio fijo y simple
  weeklySchedule: true, // Sorteos cada lunes
  transparencyMode: true // Transparencia total para generar confianza
}

export interface LotteryRules {
  // Reglas de transparencia
  allNumbersVisible: boolean // Todos pueden ver qué números están disponibles
  realTimeUpdates: boolean // Actualizaciones en tiempo real
  publicWinners: boolean // Ganadores públicos y verificables
  
  // Reglas de equidad
  equalChances: boolean // Todos tienen las mismas probabilidades
  noBots: boolean // Sin bots o usuarios falsos
  verifiedUsers: boolean // Solo usuarios verificados de Farcaster
  
  // Reglas de simplicidad
  clearPricing: boolean // Precios claros y sin sorpresas
  instantResults: boolean // Resultados instantáneos
  easyClaiming: boolean // Reclamación fácil de premios
}

export const LOTTERY_RULES: LotteryRules = {
  allNumbersVisible: true,
  realTimeUpdates: true,
  publicWinners: true,
  equalChances: true,
  noBots: true,
  verifiedUsers: true,
  clearPricing: true,
  instantResults: true,
  easyClaiming: true
}

// Función para calcular el próximo sorteo (cada lunes a las 00:00 UTC)
export function getNextLotteryDate(): Date {
  const now = new Date()
  const nextMonday = new Date(now)
  
  // Calcular días hasta el próximo lunes
  const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0) // 00:00 UTC
  
  return nextMonday
}

// Función para verificar si un sorteo está activo
export function isLotteryActive(): boolean {
  const now = new Date()
  const nextMonday = getNextLotteryDate()
  const lastMonday = new Date(nextMonday)
  lastMonday.setDate(lastMonday.getDate() - 7)
  
  return now >= lastMonday && now < nextMonday
}

// Función para obtener el tiempo restante hasta el próximo sorteo
export function getTimeUntilNextLottery(): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const now = new Date()
  const nextMonday = getNextLotteryDate()
  const timeLeft = nextMonday.getTime() - now.getTime()
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
  
  return {
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    total: Math.max(0, timeLeft / 1000)
  }
}

// Función para verificar si un usuario puede comprar más tickets
export function canUserBuyTicket(
  userId: string,
  currentTickets: number,
  totalUsers: number
): { canBuy: boolean; reason?: string } {
  // Verificar límite de usuarios
  if (totalUsers >= LOTTERY_CONFIG.maxUsers) {
    return {
      canBuy: false,
      reason: `Lotería completa (${LOTTERY_CONFIG.maxUsers} usuarios máximo)`
    }
  }
  
  // Verificar límite de tickets por usuario
  if (currentTickets >= LOTTERY_CONFIG.maxTicketsPerUser) {
    return {
      canBuy: false,
      reason: `Máximo ${LOTTERY_CONFIG.maxTicketsPerUser} tickets por usuario`
    }
  }
  
  return { canBuy: true }
}

// Función para generar números ganadores de forma transparente
export function generateWinningNumbers(): number[] {
  const numbers: number[] = []
  
  // Generar 5 números únicos entre 1 y 50
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 50) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  
  return numbers.sort((a, b) => a - b)
}

// Función para calcular premios
export function calculatePrizes(totalPool: number): {
  firstPlace: number
  secondPlace: number
  thirdPlace: number
  fourthPlace: number
  fifthPlace: number
} {
  return {
    firstPlace: Math.floor(totalPool * 0.4), // 40% para el primer lugar
    secondPlace: Math.floor(totalPool * 0.25), // 25% para el segundo lugar
    thirdPlace: Math.floor(totalPool * 0.15), // 15% para el tercer lugar
    fourthPlace: Math.floor(totalPool * 0.1), // 10% para el cuarto lugar
    fifthPlace: Math.floor(totalPool * 0.1) // 10% para el quinto lugar
  }
}

// Función para verificar si un ticket es ganador
export function checkWinningTicket(
  ticketNumber: number,
  winningNumbers: number[]
): { isWinner: boolean; position?: number } {
  if (winningNumbers.includes(ticketNumber)) {
    const position = winningNumbers.indexOf(ticketNumber) + 1
    return { isWinner: true, position }
  }
  
  return { isWinner: false }
}

// Función para verificar si se puede rascar tickets (cualquier día)
export function canScratchTickets(): boolean {
  // Ahora se puede rascar cualquier día
  return true
}

// Función para generar premios de rascar (1-10 KOKI)
export function generateScratchPrize(): { amount: number; type: 'koki' | 'nothing' } {
  const random = Math.random()
  
  // 70% probabilidad de ganar algo
  if (random < 0.7) {
    // Premio entre 1-10 KOKI
    const amount = Math.floor(Math.random() * 10) + 1
    return { amount, type: 'koki' }
  }
  
  // 30% probabilidad de no ganar nada
  return { amount: 0, type: 'nothing' }
}

// Función para obtener el nombre del día
export function getDayName(): string {
  const now = new Date()
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[now.getDay()]
}

// Función para verificar si es día de rascar (ahora cualquier día)
export function isScratchDay(): { canScratch: boolean; dayName: string; nextScratchDay: string } {
  const now = new Date()
  const dayName = getDayName()
  
  // Ahora se puede rascar cualquier día
  const canScratch = true
  
  return { 
    canScratch, 
    dayName, 
    nextScratchDay: 'Cualquier día' 
  }
}
