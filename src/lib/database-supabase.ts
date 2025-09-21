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

// Función de consulta genérica (alias para operaciones Supabase)
export async function query(sql: string, params: (string | number | null)[] = []) {
  // Como no podemos ejecutar SQL crudo fácilmente, usar funciones específicas
  console.log('⚠️ Generic SQL query not supported, use specific functions')
  return []
}

// Función para obtener un solo resultado
export async function getOne(sql: string, params: (string | number | null)[] = []) {
  console.log('⚠️ Generic SQL query not supported, use specific functions')
  return null
}

// Función para ejecutar comandos sin retorno
export async function run(sql: string, params: (string | number | null)[] = []) {
  console.log('⚠️ Generic SQL query not supported, use specific functions')
  return []
}

// Función para obtener balance de KOKI de un usuario
export async function getUserKokiBalance(userId: number): Promise<number> {
  try {
    // Obtener transacciones de KOKI para calcular balance
    const { data: earnedTransactions, error: earnedError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'koki_earned')
    
    if (earnedError) {
      console.error('Error getting earned KOKI:', earnedError)
      return 0
    }
    
    const { data: spentTransactions, error: spentError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'koki_spent')
    
    if (spentError) {
      console.error('Error getting spent KOKI:', spentError)
      return 0
    }
    
    const totalEarned = earnedTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    const totalSpent = spentTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    
    return Math.max(0, totalEarned - totalSpent)
  } catch (error) {
    console.error('Error getting user KOKI balance:', error)
    return 0
  }
}

// Función para obtener transacciones de KOKI de un usuario
export async function getUserKokiTransactions(userId: number, limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, description, created_at')
      .eq('user_id', userId)
      .in('type', ['koki_earned', 'koki_spent'])
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error getting user KOKI transactions:', error)
      return []
    }
    
    return data || []
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
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'koki_earned',
        amount: amount,
        description: description
      })
    
    if (error) {
      console.error('Error adding KOKI points:', error)
      return false
    }
    
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
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'koki_spent',
        amount: amount,
        description: description
      })
    
    if (error) {
      console.error('Error spending KOKI points:', error)
      return false
    }
    
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
    const { data: activeLotteries, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('status', 'active')
      .limit(1)
    
    if (error || !activeLotteries || activeLotteries.length === 0) {
      return { success: false, message: 'No active lottery found' }
    }
    
    const activeLottery = activeLotteries[0]
    
    // Crear ticket
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: userId,
        lottery_id: activeLottery.id,
        number: ticketNumber,
        price: 0 // Precio 0 porque se pagó con KOKI
      })
    
    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return { success: false, message: 'Failed to create ticket' }
    }
    
    return { success: true, message: 'Ticket purchased successfully' }
  } catch (error) {
    console.error('Error processing ticket purchase with KOKI:', error)
    return { success: false, message: 'Internal error' }
  }
}

// Función para raspar KoTicket
export async function scratchKoTicket(ticketId: number): Promise<{ success: boolean, prize: number }> {
  try {
    // Verificar que el ticket existe y no ha sido raspado
    const { data: ticket, error: fetchError } = await supabase
      .from('kotickets')
      .select('*')
      .eq('id', ticketId)
      .eq('is_scratched', false)
      .single()
    
    if (fetchError || !ticket) {
      return { success: false, prize: 0 }
    }
    
    // Generar premio aleatorio
    const prize = Math.floor(Math.random() * 100) + 1
    
    // Marcar como raspado y asignar premio
    const { error: updateError } = await supabase
      .from('kotickets')
      .update({
        is_scratched: true,
        prize_amount: prize,
        scratch_date: new Date().toISOString()
      })
      .eq('id', ticketId)
    
    if (updateError) {
      console.error('Error updating koticket:', updateError)
      return { success: false, prize: 0 }
    }
    
    // Agregar puntos KOKI al usuario
    if (prize > 0) {
      await addKokiPoints(ticket.user_id, prize, `KoTicket prize`)
    }
    
    return { success: true, prize }
  } catch (error) {
    console.error('Error scratching koticket:', error)
    return { success: false, prize: 0 }
  }
}

// Función para obtener KoTickets de un usuario
export async function getKoTickets(userId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('kotickets')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_time', { ascending: false })
    
    if (error) {
      console.error('Error getting kotickets:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting kotickets:', error)
    return []
  }
}

// Función para crear KoTicket
export async function createKoTicket(userId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kotickets')
      .insert({
        user_id: userId
      })
    
    if (error) {
      console.error('Error creating koticket:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error creating koticket:', error)
    return false
  }
}

// Función para actualizar balance de usuario
export async function updateUserBalance(userId: number, newBalance: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating user balance:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error updating user balance:', error)
    return false
  }
}

// Función para obtener usuario por ID
export async function getUserById(userId: number): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error getting user by ID:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

// Función para crear usuario
export async function createUser(userData: any): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        fid: userData.fid,
        display_name: userData.display_name,
        pfp_url: userData.pfp_url,
        address: userData.address
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    
    return data?.id || null
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Función para autenticar usuario
export async function authenticateUser(email: string, password: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single()
    
    if (error) {
      console.error('Error authenticating user:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error authenticating user:', error)
    return null
  }
}

// Función para obtener lotería activa
export async function getActiveLottery(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('status', 'active')
      .single()
    
    if (error) {
      console.error('Error getting active lottery:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error getting active lottery:', error)
    return null
  }
}

// Función para obtener historial de loterías
export async function getLotteryHistory(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting lottery history:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting lottery history:', error)
    return []
  }
}

// Función para obtener tickets de usuario
export async function getUserTickets(userId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        lotteries!inner(status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting user tickets:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting user tickets:', error)
    return []
  }
}

// Función para crear ticket
export async function createTicket(ticketData: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tickets')
      .insert({
        user_id: ticketData.user_id,
        lottery_id: ticketData.lottery_id,
        number: ticketData.number,
        price: ticketData.price
      })
    
    if (error) {
      console.error('Error creating ticket:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error creating ticket:', error)
    return false
  }
}

// Función para obtener estadísticas de lotería
export async function getLotteryStats(): Promise<any> {
  try {
    // Obtener total de tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('id', { count: 'exact' })
    
    if (ticketsError) {
      console.error('Error getting tickets count:', ticketsError)
    }
    
    // Obtener total de premios
    const { data: prizeData, error: prizeError } = await supabase
      .from('lotteries')
      .select('total_pool')
      .eq('status', 'completed')
    
    if (prizeError) {
      console.error('Error getting prize total:', prizeError)
    }
    
    const totalTickets = ticketsData?.length || 0
    const totalPrize = prizeData?.reduce((sum, lottery) => sum + (lottery.total_pool || 0), 0) || 0
    
    return {
      totalTickets,
      totalPrize
    }
  } catch (error) {
    console.error('Error getting lottery stats:', error)
    return { totalTickets: 0, totalPrize: 0 }
  }
}

// Función para procesar juego de ruleta
export async function processRoulettePlay(userId: number): Promise<{ success: boolean, prize: number }> {
  try {
    // Verificar que el usuario tiene suficientes KOKI para jugar
    const canPlay = await canUserPlayRoulette(userId)
    if (!canPlay.canPlay) {
      return { success: false, prize: 0 }
    }
    
    // Gastar KOKI para jugar
    const spentSuccess = await spendKokiPoints(userId, canPlay.requiredKoki, 'Roulette play')
    if (!spentSuccess) {
      return { success: false, prize: 0 }
    }
    
    // Generar premio aleatorio
    const prize = Math.floor(Math.random() * 50) + 1
    
    // Agregar premio en KOKI
    await addKokiPoints(userId, prize, 'Roulette win')
    
    return { success: true, prize }
  } catch (error) {
    console.error('Error processing roulette play:', error)
    return { success: false, prize: 0 }
  }
}

// Función para obtener configuración de ruleta
export async function getRouletteConfig(): Promise<any> {
  return { cost: 10, maxPrize: 50 }
}

// Función para crear fondo semanal
export async function createWeeklyFund(weekStart: string, totalIncome: number): Promise<number | null> {
  // Implementación básica - no necesaria para demo
  return 1
}

// Función para insertar configuración inicial del sistema
export async function insertInitialSystemConfig(): Promise<void> {
  // No necesario para Supabase - configuración hardcodeada
  console.log('System config not needed for Supabase')
}

// Exportar funciones para uso en APIs
export { querySQL, getUsers, getLotteries, insertData, updateData }
