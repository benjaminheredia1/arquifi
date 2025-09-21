import { Database } from 'sqlite3'
import { promisify } from 'util'

// Base de datos SQLite para desarrollo
let db: Database | null = null

export async function getDatabase() {
  if (!db) {
    db = new Database('./kokifi-lottery.db') // Base de datos persistente
    
    // Inicializar tablas
    await initializeDatabase()
  }
  return db
}

// Promisificar las funciones de la base de datos
const dbRun = (db: Database) => promisify(db.run.bind(db))
const dbGet = (db: Database) => promisify(db.get.bind(db))
const dbAll = (db: Database) => promisify(db.all.bind(db))

export async function initializeDatabase() {
  const database = await getDatabase()
  const run = dbRun(database)
  
  try {
    const columnExists = async (table: string, column: string): Promise<boolean> => {
      const info = await query(`PRAGMA table_info(${table})`)
      return info.some((c: any) => c.name === column)
    }
    // Crear tabla de usuarios
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fid INTEGER UNIQUE,
        display_name TEXT,
        pfp_url TEXT,
        address TEXT,
        balance REAL DEFAULT 0,
        tickets_count INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT 0
      )
    `)

    // Crear tabla de loterías
    await run(`
      CREATE TABLE IF NOT EXISTS lotteries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT DEFAULT 'active',
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_date DATETIME DEFAULT (datetime('now', '+7 days')),
        winning_numbers TEXT,
        total_pool REAL DEFAULT 0,
        total_tickets INTEGER DEFAULT 0,
        ticket_price REAL DEFAULT 10,
        winner_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (winner_id) REFERENCES users (id)
      )
    `)

    // Crear tabla de tickets
    await run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        lottery_id INTEGER,
        number INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (lottery_id) REFERENCES lotteries (id)
      )
    `)

    // Crear tabla de transacciones
    await run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'completed',
        lottery_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (lottery_id) REFERENCES lotteries (id)
      )
    `)

    // Migraciones idempotentes con verificación previa
    if (!(await columnExists('transactions', 'status'))) {
      await run(`ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'completed'`)
      console.log('✅ Added status column to transactions')
    }
    if (!(await columnExists('lotteries', 'winner_id'))) {
      await run(`ALTER TABLE lotteries ADD COLUMN winner_id INTEGER`)
      console.log('✅ Winner ID column added to lotteries table')
    }
    if (!(await columnExists('lotteries', 'total_tickets'))) {
      await run(`ALTER TABLE lotteries ADD COLUMN total_tickets INTEGER DEFAULT 0`)
      console.log('✅ Total tickets column added to lotteries table')
    }

    // Crear tabla de historial de loterías
    await run(`
      CREATE TABLE IF NOT EXISTS lottery_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lottery_id INTEGER,
        winning_numbers TEXT NOT NULL,
        total_tickets INTEGER DEFAULT 0,
        total_prize REAL DEFAULT 0,
        winner_address TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lottery_id) REFERENCES lotteries (id)
      )
    `)

    // Crear tabla de KoTickets
    await run(`
      CREATE TABLE IF NOT EXISTS kotickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_scratched BOOLEAN DEFAULT 0,
        prize_amount INTEGER DEFAULT 0,
        scratch_date DATETIME,
        price REAL DEFAULT 5,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    // Crear tabla de transacciones KOKI
    await run(`
      CREATE TABLE IF NOT EXISTS koki_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'bonus', 'roulette_cost', 'purchase_reward'
        amount INTEGER NOT NULL,
        source TEXT NOT NULL, -- 'ticket_purchase', 'roulette_play', 'daily_bonus', 'scratch_win', etc.
        source_id INTEGER, -- ID del ticket/transacción que generó los puntos
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    // Crear tabla de configuración del sistema
    await run(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de fondos semanales
    await run(`
      CREATE TABLE IF NOT EXISTS weekly_funds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start DATETIME NOT NULL,
        week_end DATETIME NOT NULL,
        total_income REAL DEFAULT 0, -- Ingresos de la semana
        capital_base REAL DEFAULT 0, -- 40% que no se toca
        prize_fund REAL DEFAULT 0, -- 40% para premios
        net_profit REAL DEFAULT 0, -- 20% de ganancia
        tickets_sold INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de logros y niveles
    await run(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        achievement_type TEXT NOT NULL, -- 'roulette_unlocked', 'big_spender', 'lucky_winner', etc.
        achievement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        koki_points_at_unlock INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    if (!(await columnExists('users', 'koki_points'))) {
      await run(`ALTER TABLE users ADD COLUMN koki_points INTEGER DEFAULT 0`)
      console.log('✅ KOKI points column added to users table')
    }
    if (!(await columnExists('lotteries', 'weekly_fund_id'))) {
      await run(`ALTER TABLE lotteries ADD COLUMN weekly_fund_id INTEGER`)
      console.log('✅ Weekly fund ID column added to lotteries table')
    }

    // Insertar configuración inicial del sistema
    await insertInitialSystemConfig()

    // Crear usuario demo
    await createDemoUser()
    
    // Crear lotería activa
    await createActiveLottery()

    // Crear loterías de ejemplo completadas
    await createSampleCompletedLotteries()

    console.log('✅ SQLite database initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

export async function insertInitialSystemConfig() {
  const database = await getDatabase()
  const run = dbRun(database)
  const get = dbGet(database)
  
  try {
    const configs = [
      { key: 'ticket_price_bs', value: '5', description: 'Precio de cada boleto en bolivianos' },
      { key: 'koki_per_ticket', value: '5', description: 'Puntos KOKI ganados por cada boleto comprado' },
      { key: 'roulette_unlock_koki', value: '25', description: 'Puntos KOKI mínimos para desbloquear la ruleta' },
      { key: 'roulette_cost_koki', value: '10', description: 'Costo en KOKI para jugar la ruleta' },
      { key: 'capital_base_percentage', value: '40', description: 'Porcentaje del fondo que va a capital base' },
      { key: 'prize_fund_percentage', value: '40', description: 'Porcentaje del fondo que va a premios' },
      { key: 'net_profit_percentage', value: '20', description: 'Porcentaje del fondo que es ganancia' },
      { key: 'weekly_target_tickets', value: '1000', description: 'Meta semanal de boletos vendidos' },
      { key: 'daily_koki_bonus', value: '2', description: 'Bonificación diaria de KOKI por login' },
      { key: 'max_roulette_plays_daily', value: '3', description: 'Máximo de jugadas de ruleta por día' }
    ]

    for (const config of configs) {
      const existing = await get(
        'SELECT * FROM system_config WHERE config_key = ?', 
        [config.key]
      )
      
      if (!existing) {
        await run(
          'INSERT INTO system_config (config_key, config_value, description) VALUES (?, ?, ?)',
          [config.key, config.value, config.description]
        )
      }
    }
    
    console.log('✅ System configuration initialized')
  } catch (error) {
    console.error('❌ Error inserting system config:', error)
  }
}

// Función para crear usuario demo
export async function createDemoUser() {
  const database = await getDatabase()
  const run = dbRun(database)
  const get = dbGet(database)
  
  try {
    // Verificar si ya existe el usuario demo
    const existingUser = await get('SELECT * FROM users WHERE username = ?', ['demo1'])
    
    if (!existingUser) {
      await run(`
        INSERT INTO users (id, username, email, password, fid, display_name, pfp_url, address, balance, tickets_count, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        1, // ID fijo para el usuario demo
        'demo1',
        'demo@kokifi.com',
        'demo123',
        12345,
        'Demo User',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        '0x1234567890123456789012345678901234567890',
        1000,
        0,
        1
      ])
      console.log('✅ Demo user created successfully')
    }
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  }
}

// Función para crear lotería activa
export async function createActiveLottery() {
  const database = await getDatabase()
  const run = dbRun(database)
  const get = dbGet(database)
  
  try {
    // Verificar si ya existe una lotería activa
    const existingLottery = await get('SELECT * FROM lotteries WHERE status = ?', ['active'])
    
    if (!existingLottery) {
      await run(`
        INSERT INTO lotteries (status, start_date, end_date, ticket_price, total_pool)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'active',
        new Date().toISOString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        10,
        0
      ])
      console.log('✅ Active lottery created successfully')
    }
  } catch (error) {
    console.error('❌ Error creating active lottery:', error)
  }
}

// Función para ejecutar consultas
export async function query(sql: string, params: (string | number | null)[] = []) {
  const database = await getDatabase()
  const all = dbAll(database)
  return await all(sql, params)
}

// Función para obtener un registro
export async function getOne(sql: string, params: (string | number | null)[] = []) {
  const database = await getDatabase()
  const get = dbGet(database)
  return await get(sql, params)
}

// Función para ejecutar una consulta
export async function run(sql: string, params: (string | number | null)[] = []) {
  const database = await getDatabase()
  const runQuery = dbRun(database)
  return await runQuery(sql, params)
}

// Función para crear loterías de ejemplo completadas
export async function createSampleCompletedLotteries() {
  const database = await getDatabase()
  const run = dbRun(database)
  const get = dbGet(database)
  
  try {
    // Verificar si ya existen loterías completadas
    const existingLotteries = await get('SELECT COUNT(*) as count FROM lotteries WHERE status = ?', ['completed'])
    
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
        ticket_price: 10,
        total_tickets: 45,
        total_pool: 450,
        winning_numbers: JSON.stringify([7, 15, 23, 31, 42]),
        winner_id: 1
      },
      {
        status: 'completed',
        start_date: '2025-08-22 00:00:00',
        end_date: '2025-08-29 23:59:59',
        ticket_price: 10,
        total_tickets: 38,
        total_pool: 380,
        winning_numbers: JSON.stringify([3, 12, 28, 35, 47]),
        winner_id: 1
      },
      {
        status: 'completed',
        start_date: '2025-08-29 00:00:00',
        end_date: '2025-09-05 23:59:59',
        ticket_price: 10,
        total_tickets: 52,
        total_pool: 520,
        winning_numbers: JSON.stringify([5, 18, 26, 39, 44]),
        winner_id: 1
      }
    ]

    for (const lottery of sampleLotteries) {
      await run(`
        INSERT INTO lotteries (
          status, start_date, end_date, ticket_price, 
          total_tickets, total_pool, winning_numbers, winner_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

// ================================
// FUNCIONES PARA MANEJO DE KOKI
// ================================

// Obtener configuración del sistema
export async function getSystemConfig(key: string): Promise<string | null> {
  const database = await getDatabase()
  const get = dbGet(database)
  
  try {
    const result = await get('SELECT config_value FROM system_config WHERE config_key = ?', [key])
    return result ? result.config_value : null
  } catch (error) {
    console.error('Error getting system config:', error)
    return null
  }
}

// Agregar puntos KOKI a un usuario
export async function addKokiPoints(
  userId: number, 
  amount: number, 
  transactionType: 'earned' | 'bonus' | 'purchase_reward',
  source: string,
  sourceId?: number,
  description?: string
): Promise<boolean> {
  const database = await getDatabase()
  const run = dbRun(database)
  
  try {
    // Iniciar transacción
    await run('BEGIN TRANSACTION')
    
    // Verificar si el usuario existe en SQLite
    const existingUser = await getOne('SELECT id FROM users WHERE id = ?', [userId])
    
    if (!existingUser) {
      // Crear usuario con datos básicos si no existe
      console.log(`📝 Creating user ${userId} in SQLite for KOKI system`)
      await run(`
        INSERT INTO users (id, username, email, password, koki_points) 
        VALUES (?, ?, ?, ?, ?)
      `, [userId, `user_${userId}`, `user${userId}@kokifi.com`, 'auto_generated', 0])
    }
    
    // Actualizar puntos del usuario
    await run(
      'UPDATE users SET koki_points = koki_points + ? WHERE id = ?',
      [amount, userId]
    )
    
    // Registrar transacción
    await run(`
      INSERT INTO koki_transactions (
        user_id, transaction_type, amount, source, source_id, description
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, transactionType, amount, source, sourceId, description])
    
    await run('COMMIT')
    
    console.log(`✅ Added ${amount} KOKI points to user ${userId}`)
    return true
  } catch (error) {
    await run('ROLLBACK')
    console.error('Error adding KOKI points:', error)
    return false
  }
}

// Gastar puntos KOKI de un usuario
export async function spendKokiPoints(
  userId: number,
  amount: number,
  source: string,
  sourceId?: number,
  description?: string
): Promise<boolean> {
  const database = await getDatabase()
  const run = dbRun(database)
  const get = dbGet(database)
  
  try {
    // Verificar si el usuario tiene suficientes puntos
    const user = await get('SELECT koki_points FROM users WHERE id = ?', [userId])
    if (!user || user.koki_points < amount) {
      console.log(`❌ User ${userId} doesn't have enough KOKI points (has: ${user?.koki_points}, needs: ${amount})`)
      return false
    }
    
    // Iniciar transacción
    await run('BEGIN TRANSACTION')
    
    // Descontar puntos del usuario
    await run(
      'UPDATE users SET koki_points = koki_points - ? WHERE id = ?',
      [amount, userId]
    )
    
    // Registrar transacción
    await run(`
      INSERT INTO koki_transactions (
        user_id, transaction_type, amount, source, source_id, description
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, 'spent', amount, source, sourceId, description])
    
    await run('COMMIT')
    
    console.log(`✅ Spent ${amount} KOKI points from user ${userId}`)
    return true
  } catch (error) {
    await run('ROLLBACK')
    console.error('Error spending KOKI points:', error)
    return false
  }
}

// Obtener balance de KOKI de un usuario
export async function getUserKokiBalance(userId: number): Promise<number> {
  try {
    const result = await getOne('SELECT koki_points FROM users WHERE id = ?', [userId])
    return result ? result.koki_points || 0 : 0
  } catch (error) {
    console.error('Error getting user KOKI balance:', error)
    return 0
  }
}

// Verificar si el usuario puede jugar la ruleta
export async function canUserPlayRoulette(userId: number): Promise<{canPlay: boolean, requiredKoki: number, userKoki: number}> {
  try {
    const requiredKoki = parseInt(await getSystemConfig('roulette_unlock_koki') || '25')
    const userKoki = await getUserKokiBalance(userId)
    
    return {
      canPlay: userKoki >= requiredKoki,
      requiredKoki,
      userKoki
    }
  } catch (error) {
    console.error('Error checking roulette eligibility:', error)
    return {canPlay: false, requiredKoki: 25, userKoki: 0}
  }
}

// Procesar compra de boleto y otorgar KOKI
export async function processTicketPurchaseWithKoki(
  userId: number,
  ticketPrice: number,
  ticketId: number
): Promise<boolean> {
  try {
    const kokiPerTicket = parseInt(await getSystemConfig('koki_per_ticket') || '5')
    
    const success = await addKokiPoints(
      userId,
      kokiPerTicket,
      'purchase_reward',
      'ticket_purchase',
      ticketId,
      `Reward for purchasing ticket #${ticketId}`
    )
    
    return success
  } catch (error) {
    console.error('Error processing ticket purchase KOKI reward:', error)
    return false
  }
}

// Obtener historial de transacciones KOKI de un usuario
export async function getUserKokiTransactions(userId: number, limit: number = 10): Promise<any[]> {
  try {
    const transactions = await query(`
      SELECT 
        id,
        transaction_type,
        amount,
        source,
        description,
        created_at
      FROM koki_transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [userId, limit])
    
    return transactions
  } catch (error) {
    console.error('Error getting user KOKI transactions:', error)
    return []
  }
}

// Crear fondo semanal
export async function createWeeklyFund(weekStart: string, totalIncome: number): Promise<number | null> {
  const database = await getDatabase()
  const run = dbRun(database)
  
  try {
    const capitalBasePercentage = parseInt(await getSystemConfig('capital_base_percentage') || '40')
    const prizeFundPercentage = parseInt(await getSystemConfig('prize_fund_percentage') || '40') 
    const netProfitPercentage = parseInt(await getSystemConfig('net_profit_percentage') || '20')
    
    const capitalBase = (totalIncome * capitalBasePercentage) / 100
    const prizeFund = (totalIncome * prizeFundPercentage) / 100
    const netProfit = (totalIncome * netProfitPercentage) / 100
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    const result = await run(`
      INSERT INTO weekly_funds (
        week_start, week_end, total_income, capital_base, prize_fund, net_profit
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [weekStart, weekEnd.toISOString(), totalIncome, capitalBase, prizeFund, netProfit])
    
    console.log(`✅ Weekly fund created with income: Bs ${totalIncome}`)
    return result.lastID
  } catch (error) {
    console.error('Error creating weekly fund:', error)
    return null
  }
}
