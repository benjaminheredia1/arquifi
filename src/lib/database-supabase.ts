import { supabase, querySQL, getUsers, getLotteries, insertData, updateData } from './supabase'

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing Supabase database...')

    // Crear tabla de usuarios
    await querySQL(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fid INTEGER,
        display_name VARCHAR(100),
        pfp_url TEXT,
        address VARCHAR(100),
        balance DECIMAL(15,2) DEFAULT 1000.00,
        tickets_count INTEGER DEFAULT 0,
        total_spent DECIMAL(15,2) DEFAULT 0.00,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT false
      )
    `)

    // Crear tabla de loterías
    await querySQL(`
      CREATE TABLE IF NOT EXISTS lotteries (
        id SERIAL PRIMARY KEY,
        status VARCHAR(20) DEFAULT 'active',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
        winning_numbers TEXT,
        total_pool DECIMAL(15,2) DEFAULT 0.00,
        total_tickets INTEGER DEFAULT 0,
        ticket_price DECIMAL(10,2) DEFAULT 10.00,
        winner_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (winner_id) REFERENCES users (id)
      )
    `)

    // Crear tabla de tickets
    await querySQL(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        lottery_id INTEGER,
        number INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (lottery_id) REFERENCES lotteries (id)
      )
    `)

    // Crear tabla de transacciones
    await querySQL(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        type VARCHAR(20) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    // Crear tabla de KoTickets
    await querySQL(`
      CREATE TABLE IF NOT EXISTS kotickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_scratched BOOLEAN DEFAULT false,
        prize_amount DECIMAL(10,2) DEFAULT 0.00,
        scratch_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    // Crear usuario demo
    await createDemoUser()
    
    // Crear lotería activa
    await createActiveLottery()

    // Crear loterías de ejemplo completadas
    await createSampleCompletedLotteries()

    console.log('✅ Supabase database initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

// Función para crear usuario demo
export async function createDemoUser() {
  try {
    // Verificar si ya existe el usuario demo
    const existingUsers = await getUsers('username', ['demo1'])
    const existingUser = existingUsers[0] || null
    
    if (!existingUser) {
      await querySQL(`
        INSERT INTO users (id, username, email, password, fid, display_name, pfp_url, address, balance, tickets_count, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        1, // ID fijo para el usuario demo
        'demo1',
        'demo@kokifi.com',
        'demo123',
        12345,
        'Demo User',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        '0x1234567890abcdef',
        1000.00,
        0,
        1
      ])
      console.log('✅ Demo user created')
    }
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  }
}

// Función para crear lotería activa
export async function createActiveLottery() {
  try {
    // Verificar si ya existe una lotería activa
    const existingLotteries = await getLotteries('status', ['active'])
    const existingLottery = existingLotteries[0] || null
    
    if (!existingLottery) {
      await querySQL(`
        INSERT INTO lotteries (status, start_date, end_date, ticket_price, total_pool, total_tickets)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'active',
        new Date().toISOString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
        10.00,
        0.00,
        0
      ])
      console.log('✅ Active lottery created')
    }
  } catch (error) {
    console.error('❌ Error creating active lottery:', error)
  }
}

// Función para crear loterías de ejemplo completadas
export async function createSampleCompletedLotteries() {
  try {
    // Verificar si ya existen loterías completadas
    const completedLotteries = await getLotteries('status', ['completed'])
    const existingLotteries = { count: completedLotteries.length }
    
    if (existingLotteries.count > 0) {
      console.log('Loterías completadas ya existen, saltando creación')
      return
    }

    // Crear 3 loterías completadas de ejemplo
    const sampleLotteries = [
      {
        status: 'completed',
        start_date: '2025-08-15 00:00:00',
        end_date: '2025-08-22 23:59:59',
        ticket_price: 10.00,
        total_tickets: 45,
        total_pool: 450.00,
        winning_numbers: JSON.stringify([7, 15, 23, 31, 42]),
        winner_id: 1
      },
      {
        status: 'completed',
        start_date: '2025-08-22 00:00:00',
        end_date: '2025-08-29 23:59:59',
        ticket_price: 10.00,
        total_tickets: 38,
        total_pool: 380.00,
        winning_numbers: JSON.stringify([3, 12, 28, 35, 47]),
        winner_id: 1
      },
      {
        status: 'completed',
        start_date: '2025-08-29 00:00:00',
        end_date: '2025-09-05 23:59:59',
        ticket_price: 10.00,
        total_tickets: 52,
        total_pool: 520.00,
        winning_numbers: JSON.stringify([5, 18, 26, 39, 44]),
        winner_id: 1
      }
    ]

    for (const lottery of sampleLotteries) {
      await querySQL(`
        INSERT INTO lotteries (
          status, start_date, end_date, ticket_price, 
          total_tickets, total_pool, winning_numbers, winner_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        lottery.status,
        lottery.start_date,
        lottery.end_date,
        lottery.ticket_price,
        lottery.total_tickets,
        lottery.total_pool,
        lottery.winning_numbers,
        lottery.winner_id
      ])
    }

    console.log('✅ Loterías de ejemplo completadas creadas')
  } catch (error) {
    console.error('❌ Error creating sample completed lotteries:', error)
  }
}

// Funciones para compatibilidad con database-sqlite

// Función de consulta genérica (alias para querySQL)
export async function query(sql: string, params: (string | number | null)[] = []) {
  return await querySQL(sql, params)
}

// Función para obtener un solo resultado
export async function getOne(sql: string, params: (string | number | null)[] = []) {
  const result = await querySQL(sql, params)
  return result.length > 0 ? result[0] : null
}

// Función para ejecutar comandos sin retorno
export async function run(sql: string, params: (string | number | null)[] = []) {
  return await querySQL(sql, params)
}

// Función para obtener balance de KOKI de un usuario
export async function getUserKokiBalance(userId: number): Promise<number> {
  try {
    // Obtener el total de puntos KOKI ganados
    const earnedResult = await querySQL(`
      SELECT COALESCE(SUM(amount), 0) as total_earned
      FROM transactions
      WHERE user_id = $1 AND type = 'koki_earned'
    `, [userId])
    
    // Obtener el total de puntos KOKI gastados
    const spentResult = await querySQL(`
      SELECT COALESCE(SUM(amount), 0) as total_spent
      FROM transactions
      WHERE user_id = $1 AND type = 'koki_spent'
    `, [userId])
    
    const totalEarned = earnedResult[0]?.total_earned || 0
    const totalSpent = spentResult[0]?.total_spent || 0
    
    return Math.max(0, totalEarned - totalSpent)
  } catch (error) {
    console.error('Error getting user KOKI balance:', error)
    return 0
  }
}

// Función para obtener transacciones de KOKI de un usuario
export async function getUserKokiTransactions(userId: number, limit: number = 10): Promise<any[]> {
  try {
    const result = await querySQL(`
      SELECT type, amount, description, created_at
      FROM transactions
      WHERE user_id = $1 AND (type = 'koki_earned' OR type = 'koki_spent')
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit])
    
    return result
  } catch (error) {
    console.error('Error getting user KOKI transactions:', error)
    return []
  }
}

// Función para verificar si un usuario puede jugar la ruleta
export async function canUserPlayRoulette(userId: number): Promise<{canPlay: boolean, requiredKoki: number, userKoki: number}> {
  try {
    const requiredKoki = 10 // Costo por jugar la ruleta
    const userKoki = await getUserKokiBalance(userId)
    
    return {
      canPlay: userKoki >= requiredKoki,
      requiredKoki,
      userKoki
    }
  } catch (error) {
    console.error('Error checking roulette eligibility:', error)
    return { canPlay: false, requiredKoki: 10, userKoki: 0 }
  }
}

// Función para obtener configuración del sistema
export async function getSystemConfig(key: string): Promise<string | null> {
  try {
    // Como no tenemos tabla de configuración en Supabase, retornamos valores por defecto
    const defaultConfigs: { [key: string]: string } = {
      'roulette_cost': '10',
      'koticket_cost': '5',
      'ticket_cost': '10'
    }
    
    return defaultConfigs[key] || null
  } catch (error) {
    console.error('Error getting system config:', error)
    return null
  }
}

// Función para agregar puntos KOKI
export async function addKokiPoints(
  userId: number,
  amount: number,
  description: string = 'KOKI points earned'
): Promise<boolean> {
  try {
    await querySQL(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES ($1, 'koki_earned', $2, $3)
    `, [userId, amount, description])
    
    console.log(`✅ Added ${amount} KOKI points to user ${userId}`)
    return true
  } catch (error) {
    console.error('Error adding KOKI points:', error)
    return false
  }
}

// Función para gastar puntos KOKI
export async function spendKokiPoints(
  userId: number,
  amount: number,
  description: string = 'KOKI points spent'
): Promise<boolean> {
  try {
    const currentBalance = await getUserKokiBalance(userId)
    
    if (currentBalance < amount) {
      console.log(`❌ User ${userId} doesn't have enough KOKI points`)
      return false
    }
    
    await querySQL(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES ($1, 'koki_spent', $2, $3)
    `, [userId, amount, description])
    
    console.log(`✅ Spent ${amount} KOKI points from user ${userId}`)
    return true
  } catch (error) {
    console.error('Error spending KOKI points:', error)
    return false
  }
}

// Función para procesar compra de ticket con KOKI
export async function processTicketPurchaseWithKoki(
  userId: number,
  ticketNumber: number,
  kokiCost: number
): Promise<{ success: boolean, message: string }> {
  try {
    // Verificar balance
    const currentBalance = await getUserKokiBalance(userId)
    if (currentBalance < kokiCost) {
      return { success: false, message: 'Insufficient KOKI balance' }
    }
    
    // Gastar KOKI
    const spentSuccess = await spendKokiPoints(userId, kokiCost, `Ticket purchase #${ticketNumber}`)
    if (!spentSuccess) {
      return { success: false, message: 'Failed to spend KOKI points' }
    }
    
    // Obtener lotería activa
    const activeLotteries = await getLotteries('status', ['active'])
    if (activeLotteries.length === 0) {
      return { success: false, message: 'No active lottery found' }
    }
    
    const activeLottery = activeLotteries[0]
    
    // Crear ticket
    await querySQL(`
      INSERT INTO tickets (user_id, lottery_id, number, price)
      VALUES ($1, $2, $3, $4)
    `, [userId, activeLottery.id, ticketNumber, 0]) // Precio 0 porque se pagó con KOKI
    
    return { success: true, message: 'Ticket purchased successfully' }
  } catch (error) {
    console.error('Error processing ticket purchase with KOKI:', error)
    return { success: false, message: 'Internal error' }
  }
}

// Funciones adicionales necesarias (implementaciones básicas)
export async function scratchKoTicket(ticketId: number): Promise<{ success: boolean, prize: number }> {
  // Implementación básica
  return { success: true, prize: Math.floor(Math.random() * 100) }
}

export async function getKoTickets(userId: number): Promise<any[]> {
  try {
    return await querySQL(`
      SELECT * FROM kotickets WHERE user_id = $1 ORDER BY purchase_time DESC
    `, [userId])
  } catch (error) {
    return []
  }
}

export async function createKoTicket(userId: number): Promise<boolean> {
  try {
    await querySQL(`
      INSERT INTO kotickets (user_id) VALUES ($1)
    `, [userId])
    return true
  } catch (error) {
    return false
  }
}

export async function updateUserBalance(userId: number, newBalance: number): Promise<boolean> {
  try {
    await querySQL(`
      UPDATE users SET balance = $1 WHERE id = $2
    `, [newBalance, userId])
    return true
  } catch (error) {
    return false
  }
}

export async function getUserById(userId: number): Promise<any> {
  try {
    const result = await querySQL(`
      SELECT * FROM users WHERE id = $1
    `, [userId])
    return result[0] || null
  } catch (error) {
    return null
  }
}

export async function createUser(userData: any): Promise<number | null> {
  try {
    const result = await querySQL(`
      INSERT INTO users (username, email, password, fid, display_name, pfp_url, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [userData.username, userData.email, userData.password, userData.fid, 
        userData.display_name, userData.pfp_url, userData.address])
    return result[0]?.id || null
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<any> {
  try {
    const result = await querySQL(`
      SELECT * FROM users WHERE email = $1 AND password = $2
    `, [email, password])
    return result[0] || null
  } catch (error) {
    return null
  }
}

export async function getActiveLottery(): Promise<any> {
  try {
    const result = await getLotteries('status', ['active'])
    return result[0] || null
  } catch (error) {
    return null
  }
}

export async function getLotteryHistory(): Promise<any[]> {
  try {
    return await getLotteries('status', ['completed'])
  } catch (error) {
    return []
  }
}

export async function getUserTickets(userId: number): Promise<any[]> {
  try {
    return await querySQL(`
      SELECT t.*, l.status as lottery_status 
      FROM tickets t 
      JOIN lotteries l ON t.lottery_id = l.id 
      WHERE t.user_id = $1 
      ORDER BY t.created_at DESC
    `, [userId])
  } catch (error) {
    return []
  }
}

export async function createTicket(ticketData: any): Promise<boolean> {
  try {
    await querySQL(`
      INSERT INTO tickets (user_id, lottery_id, number, price)
      VALUES ($1, $2, $3, $4)
    `, [ticketData.user_id, ticketData.lottery_id, ticketData.number, ticketData.price])
    return true
  } catch (error) {
    return false
  }
}

export async function getLotteryStats(): Promise<any> {
  try {
    const totalTickets = await querySQL(`SELECT COUNT(*) as count FROM tickets`)
    const totalPrize = await querySQL(`SELECT SUM(total_pool) as total FROM lotteries WHERE status = 'completed'`)
    return {
      totalTickets: totalTickets[0]?.count || 0,
      totalPrize: totalPrize[0]?.total || 0
    }
  } catch (error) {
    return { totalTickets: 0, totalPrize: 0 }
  }
}

export async function processRoulettePlay(userId: number): Promise<{ success: boolean, prize: number }> {
  // Implementación básica de ruleta
  const prize = Math.floor(Math.random() * 50) + 1
  await addKokiPoints(userId, prize, 'Roulette win')
  return { success: true, prize }
}

export async function getRouletteConfig(): Promise<any> {
  return { cost: 10, maxPrize: 50 }
}

export async function createWeeklyFund(weekStart: string, totalIncome: number): Promise<number | null> {
  // Implementación básica
  return 1
}

export async function insertInitialSystemConfig(): Promise<void> {
  // No necesario para Supabase
  console.log('System config not needed for Supabase')
}

// Exportar funciones para uso en APIs
export { querySQL, getUsers, getLotteries, insertData, updateData }
