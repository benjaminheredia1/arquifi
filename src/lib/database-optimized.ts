import { Database } from 'sqlite3'
import { promisify } from 'util'

// Base de datos SQLite optimizada para Vercel
let db: Database | null = null

// Cache en memoria para consultas frecuentes
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 60 segundos

// Cache de conexión para evitar cold starts
let connectionPromise: Promise<Database> | null = null

export async function getDatabase() {
  if (db) {
    return db
  }

  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      // Usar base de datos en memoria para mejor rendimiento
      db = new Database(':memory:')
      
      // Optimizaciones agresivas para rendimiento
      await db.run('PRAGMA journal_mode = MEMORY')
      await db.run('PRAGMA synchronous = OFF')
      await db.run('PRAGMA cache_size = 10000')
      await db.run('PRAGMA temp_store = MEMORY')
      await db.run('PRAGMA mmap_size = 268435456') // 256MB
      await db.run('PRAGMA page_size = 4096')
      await db.run('PRAGMA auto_vacuum = NONE')
      
      // Inicializar tablas
      await initializeDatabase()
      
      resolve(db)
    } catch (error) {
      reject(error)
    }
  })

  return connectionPromise
}

// Promisificar las funciones de la base de datos
const dbRun = (db: Database) => promisify(db.run.bind(db))
const dbGet = (db: Database) => promisify(db.get.bind(db))
const dbAll = (db: Database) => promisify(db.all.bind(db))

export async function initializeDatabase() {
  const database = await getDatabase()
  const run = dbRun(database)
  
  try {
    // Crear tabla de usuarios
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fid INTEGER UNIQUE,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT,
        pfp_url TEXT,
        address TEXT,
        balance REAL DEFAULT 0,
        tickets_count INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de loterías
    await run(`
      CREATE TABLE IF NOT EXISTS lotteries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        ticket_price REAL DEFAULT 10,
        total_tickets INTEGER DEFAULT 0,
        total_pool REAL DEFAULT 0,
        winning_numbers TEXT,
        winners TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de tickets
    await run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lottery_id INTEGER,
        number INTEGER NOT NULL,
        owner_id INTEGER,
        purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_winner BOOLEAN DEFAULT FALSE,
        price REAL DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lottery_id) REFERENCES lotteries(id),
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `)

    // Crear tabla de KoTickets
    await run(`
      CREATE TABLE IF NOT EXISTS kotickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER,
        purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_scratched BOOLEAN DEFAULT FALSE,
        prize REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
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
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lottery_id) REFERENCES lotteries(id)
      )
    `)

    // Crear índices para mejor rendimiento
    await run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    await run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
    await run('CREATE INDEX IF NOT EXISTS idx_tickets_owner ON tickets(owner_id)')
    await run('CREATE INDEX IF NOT EXISTS idx_tickets_lottery ON tickets(lottery_id)')
    await run('CREATE INDEX IF NOT EXISTS idx_kotickets_owner ON kotickets(owner_id)')
    await run('CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)')

    // Crear usuario demo
    await createDemoUser()
    
    // Crear lotería activa
    await createActiveLottery()

    console.log('✅ Optimized SQLite database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
}

// Función para ejecutar consultas con caché
export async function query(sql: string, params: any[] = []) {
  // Crear clave de caché
  const cacheKey = `query:${sql}:${JSON.stringify(params)}`
  
  // Verificar caché
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  const database = await getDatabase()
  const all = dbAll(database)
  const result = await all(sql, params)
  
  // Guardar en caché
  cache.set(cacheKey, { data: result, timestamp: Date.now() })
  
  return result
}

// Función para obtener un registro con caché
export async function getOne(sql: string, params: any[] = []) {
  // Crear clave de caché
  const cacheKey = `getOne:${sql}:${JSON.stringify(params)}`
  
  // Verificar caché
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  const database = await getDatabase()
  const get = dbGet(database)
  const result = await get(sql, params)
  const finalResult = result || null
  
  // Guardar en caché
  cache.set(cacheKey, { data: finalResult, timestamp: Date.now() })
  
  return finalResult
}

// Función para ejecutar una consulta (sin caché para escritura)
export async function run(sql: string, params: any[] = []) {
  const database = await getDatabase()
  const runQuery = dbRun(database)
  const result = await runQuery(sql, params)
  
  // Limpiar caché relacionado
  clearRelatedCache(sql)
  
  return result
}

// Limpiar caché relacionado cuando se modifica la base de datos
function clearRelatedCache(sql: string) {
  const lowerSql = sql.toLowerCase()
  
  if (lowerSql.includes('insert') || lowerSql.includes('update') || lowerSql.includes('delete')) {
    // Limpiar todo el caché si se modifica la base de datos
    cache.clear()
  }
}

// Crear usuario demo
export async function createDemoUser() {
  try {
    const existingUser = await getOne('SELECT * FROM users WHERE email = ?', ['demo1@kokifi.com'])
    
    if (!existingUser) {
      await run(`
        INSERT INTO users (fid, username, email, password, display_name, pfp_url, address, balance, tickets_count, total_spent, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        12345,
        'demo1',
        'demo1@kokifi.com',
        'demo123',
        'Usuario Demo 1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=demo1',
        '0x1234567890123456789012345678901234567890',
        1000,
        0,
        0,
        true
      ])
      console.log('✅ Demo user created successfully')
    }
  } catch (error) {
    console.error('❌ Demo user creation error:', error)
  }
}

// Crear lotería activa
export async function createActiveLottery() {
  try {
    const existingLottery = await getOne('SELECT * FROM lotteries WHERE is_active = TRUE')
    
    if (!existingLottery) {
      const endTime = new Date()
      endTime.setDate(endTime.getDate() + 7) // 7 días desde ahora
      
      await run(`
        INSERT INTO lotteries (start_time, end_time, ticket_price, total_tickets, total_pool, is_active, is_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        new Date(),
        endTime,
        10,
        0,
        0,
        true,
        false
      ])
      console.log('✅ Active lottery created successfully')
    }
  } catch (error) {
    console.error('❌ Active lottery creation error:', error)
  }
}

// Función para limpiar caché manualmente
export function clearCache() {
  cache.clear()
  console.log('✅ Cache cleared')
}

// Función para obtener estadísticas del caché
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  }
}
