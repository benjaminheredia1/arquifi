// Base de datos en memoria para demo funcional
interface User {
  id: string
  username: string
  email: string
  password: string
  fid: number
  displayName: string
  pfpUrl: string
  address: string
  balance: string
  ticketsCount: number
  totalSpent: string
  joinedAt: string
  isVerified: boolean
}

interface Ticket {
  id: string
  userId: string
  number: number
  lotteryId: string
  purchaseDate: string
  price: string
}

interface Lottery {
  id: string
  startDate: string
  endDate: string
  winningNumbers: number[]
  totalTickets: number
  totalPrize: string
  status: 'active' | 'completed' | 'pending'
  winner?: string
}

interface Transaction {
  id: string
  userId: string
  type: 'purchase' | 'win' | 'bonus'
  amount: string
  description: string
  date: string
  lotteryId?: string
}

class DemoDatabase {
  private users: Map<string, User> = new Map()
  private tickets: Map<string, Ticket> = new Map()
  private lotteries: Map<string, Lottery> = new Map()
  private transactions: Map<string, Transaction> = new Map()
  private userByEmail: Map<string, string> = new Map() // email -> userId

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    // Usuarios demo predefinidos
    const demoUsers: User[] = [
      {
        id: 'demo1',
        username: 'UsuarioDemo1',
        email: 'demo1@kokifi.com',
        password: 'demo123',
        fid: 12345,
        displayName: 'Usuario Demo 1',
        pfpUrl: 'https://cdn-icons-png.flaticon.com/512/1998/1998665.png', // 🐱 Gato
        address: '0x1234567890123456789012345678901234567890',
        balance: '1500',
        ticketsCount: 5,
        totalSpent: '50',
        joinedAt: new Date('2024-01-15').toISOString(),
        isVerified: true
      },
      {
        id: 'demo2',
        username: 'LuckyPlayer',
        email: 'demo2@kokifi.com',
        password: 'demo123',
        fid: 67890,
        displayName: 'Lucky Player',
        pfpUrl: 'https://cdn-icons-png.flaticon.com/512/1998/1998664.png', // 🐶 Perro
        address: '0x9876543210987654321098765432109876543210',
        balance: '800',
        ticketsCount: 12,
        totalSpent: '120',
        joinedAt: new Date('2024-01-20').toISOString(),
        isVerified: true
      },
      {
        id: 'demo3',
        username: 'Winner2024',
        email: 'demo3@kokifi.com',
        password: 'demo123',
        fid: 11111,
        displayName: 'Winner 2024',
        pfpUrl: 'https://cdn-icons-png.flaticon.com/512/1998/1998663.png', // 🐰 Conejo
        address: '0x5555555555555555555555555555555555555555',
        balance: '2500',
        ticketsCount: 8,
        totalSpent: '80',
        joinedAt: new Date('2024-02-01').toISOString(),
        isVerified: true
      }
    ]

    // Agregar usuarios demo
    demoUsers.forEach(user => {
      this.users.set(user.id, user)
      this.userByEmail.set(user.email, user.id)
    })

    // Lotería actual
    const currentLottery: Lottery = {
      id: 'lottery_current',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      winningNumbers: [],
      totalTickets: 0,
      totalPrize: '0',
      status: 'active'
    }
    this.lotteries.set(currentLottery.id, currentLottery)

    // Crear loterías pasadas desde agosto 2024
    const createPastLottery = (weeksAgo: number, winningNumbers: number[], winnerId: string, totalTickets: number) => {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - (weeksAgo * 7))
      
      // Asegurar que sea un lunes
      const dayOfWeek = endDate.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      endDate.setDate(endDate.getDate() - daysToMonday)
      endDate.setHours(0, 0, 0, 0)
      
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 7)
      
      return {
        id: `lottery_past_${weeksAgo}`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        winningNumbers,
        totalTickets,
        totalPrize: (totalTickets * 10).toString(),
        status: 'completed' as const,
        winner: winnerId
      }
    }

    // Loterías pasadas (cada lunes desde agosto)
    const pastLotteries = [
      createPastLottery(1, [7, 23, 31, 42, 15], 'demo2', 25),
      createPastLottery(2, [3, 18, 29, 41, 8], 'demo1', 32),
      createPastLottery(3, [12, 25, 37, 44, 6], 'demo3', 28),
      createPastLottery(4, [5, 19, 33, 46, 11], 'demo2', 35),
      createPastLottery(5, [9, 22, 38, 45, 2], 'demo1', 41),
      createPastLottery(6, [14, 27, 39, 48, 13], 'demo3', 38),
      createPastLottery(7, [1, 16, 34, 47, 20], 'demo2', 44),
      createPastLottery(8, [4, 21, 36, 49, 17], 'demo1', 52),
      createPastLottery(9, [10, 24, 40, 50, 26], 'demo3', 48),
      createPastLottery(10, [8, 30, 43, 35, 7], 'demo2', 55),
      createPastLottery(11, [15, 28, 42, 31, 19], 'demo1', 61),
      createPastLottery(12, [6, 32, 45, 18, 23], 'demo3', 58),
      createPastLottery(13, [11, 29, 46, 37, 4], 'demo2', 67),
      createPastLottery(14, [2, 25, 48, 41, 14], 'demo1', 72),
      createPastLottery(15, [13, 33, 49, 22, 9], 'demo3', 69),
      createPastLottery(16, [17, 38, 50, 26, 12], 'demo2', 75),
      createPastLottery(17, [3, 27, 44, 35, 21], 'demo1', 78),
      createPastLottery(18, [20, 39, 47, 16, 5], 'demo3', 82),
      createPastLottery(19, [8, 31, 45, 24, 18], 'demo2', 85),
      createPastLottery(20, [1, 28, 42, 37, 15], 'demo1', 89)
    ]

    pastLotteries.forEach(lottery => {
      this.lotteries.set(lottery.id, lottery)
    })
  }

  // Métodos de usuario
  createUser(userData: Omit<User, 'id' | 'joinedAt' | 'balance' | 'ticketsCount' | 'totalSpent' | 'isVerified'>): User {
    // Verificar si el email ya existe
    if (this.userByEmail.has(userData.email)) {
      throw new Error('Este email ya está registrado')
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fid = Math.floor(Math.random() * 100000) + 1000
    const address = `0x${Math.random().toString(16).substr(2, 40)}`

    const newUser: User = {
      ...userData,
      id,
      fid,
      address,
      balance: '1000', // Bono de bienvenida
      ticketsCount: 0,
      totalSpent: '0',
      joinedAt: new Date().toISOString(),
      isVerified: false
    }

    this.users.set(id, newUser)
    this.userByEmail.set(userData.email, id)
    return newUser
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null
  }

  getUserByEmail(email: string): User | null {
    const userId = this.userByEmail.get(email)
    return userId ? this.users.get(userId) || null : null
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser = { ...user, ...updates }
    this.users.set(id, updatedUser)
    return updatedUser
  }

  // Métodos de tickets
  createTicket(userId: string, number: number, lotteryId: string, price: string): Ticket {
    const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const ticket: Ticket = {
      id,
      userId,
      number,
      lotteryId,
      purchaseDate: new Date().toISOString(),
      price
    }

    this.tickets.set(id, ticket)
    return ticket
  }

  getTicketsByUser(userId: string): Ticket[] {
    return Array.from(this.tickets.values()).filter(ticket => ticket.userId === userId)
  }

  getTicketsByLottery(lotteryId: string): Ticket[] {
    return Array.from(this.tickets.values()).filter(ticket => ticket.lotteryId === lotteryId)
  }

  // Métodos de lotería
  getCurrentLottery(): Lottery | null {
    return this.lotteries.get('lottery_current') || null
  }

  getPastLotteries(): Lottery[] {
    return Array.from(this.lotteries.values()).filter(lottery => lottery.status === 'completed')
  }

  updateLottery(id: string, updates: Partial<Lottery>): Lottery | null {
    const lottery = this.lotteries.get(id)
    if (!lottery) return null

    const updatedLottery = { ...lottery, ...updates }
    this.lotteries.set(id, updatedLottery)
    return updatedLottery
  }

  // Métodos de transacciones
  createTransaction(userId: string, type: 'purchase' | 'win' | 'bonus', amount: string, description: string, lotteryId?: string): Transaction {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transaction: Transaction = {
      id,
      userId,
      type,
      amount,
      description,
      date: new Date().toISOString(),
      lotteryId
    }

    this.transactions.set(id, transaction)
    return transaction
  }

  getTransactionsByUser(userId: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(tx => tx.userId === userId)
  }

  // Método para calcular precio dinámico del ticket
  calculateTicketPrice(): number {
    const currentLottery = this.getCurrentLottery()
    if (!currentLottery) return 10 // Precio base

    const totalTickets = currentLottery.totalTickets
    // Precio base: 10 KOKI, aumenta 1 KOKI por cada 10 tickets vendidos
    const dynamicPrice = 10 + Math.floor(totalTickets / 10)
    return Math.min(dynamicPrice, 50) // Máximo 50 KOKI
  }

  // Método para comprar ticket
  buyTicket(userId: string, number: number): { success: boolean; ticket?: Ticket; error?: string; price?: number } {
    const user = this.getUserById(userId)
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    const currentLottery = this.getCurrentLottery()
    if (!currentLottery) return { success: false, error: 'No hay lotería activa' }

    if (currentLottery.status !== 'active') {
      return { success: false, error: 'La lotería no está activa' }
    }

    // Verificar si el número ya está tomado
    const existingTickets = this.getTicketsByLottery(currentLottery.id)
    if (existingTickets.some(ticket => ticket.number === number)) {
      return { success: false, error: 'Este número ya está tomado' }
    }

    // Calcular precio dinámico
    const ticketPrice = this.calculateTicketPrice()

    // Verificar balance
    const userBalance = parseFloat(user.balance)
    if (userBalance < ticketPrice) {
      return { success: false, error: `Balance insuficiente. Necesitas ${ticketPrice} KOKI` }
    }

    // Crear ticket
    const ticket = this.createTicket(userId, number, currentLottery.id, ticketPrice.toString())

    // Actualizar usuario
    const newBalance = (userBalance - ticketPrice).toString()
    const newTicketsCount = user.ticketsCount + 1
    const newTotalSpent = (parseFloat(user.totalSpent) + ticketPrice).toString()

    this.updateUser(userId, {
      balance: newBalance,
      ticketsCount: newTicketsCount,
      totalSpent: newTotalSpent
    })

    // Actualizar lotería
    const newTotalTickets = currentLottery.totalTickets + 1
    const newTotalPrize = (parseFloat(currentLottery.totalPrize) + ticketPrice).toString()

    this.updateLottery(currentLottery.id, {
      totalTickets: newTotalTickets,
      totalPrize: newTotalPrize
    })

    // Crear transacción
    this.createTransaction(userId, 'purchase', ticketPrice.toString(), `Ticket #${number} comprado`, currentLottery.id)

    return { success: true, ticket, price: ticketPrice }
  }

  // Método para obtener estadísticas
  getStats() {
    const totalUsers = this.users.size
    const totalTickets = this.tickets.size
    const totalPrize = Array.from(this.lotteries.values())
      .reduce((sum, lottery) => sum + parseFloat(lottery.totalPrize), 0)

    return {
      totalUsers,
      totalTickets,
      totalPrize: totalPrize.toString(),
      activeLotteries: Array.from(this.lotteries.values()).filter(l => l.status === 'active').length
    }
  }
}

// Instancia global de la base de datos
export const database = new DemoDatabase()
export type { User, Ticket, Lottery, Transaction }
