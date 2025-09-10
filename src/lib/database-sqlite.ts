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
        ticket_price REAL DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    // Migración: Agregar campo status si no existe
    try {
      await run(`ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'completed'`)
    } catch (error) {
      // La columna ya existe, ignorar el error
      console.log('Status column already exists or migration failed:', error)
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

    // Crear usuario demo
    await createDemoUser()
    
    // Crear lotería activa
    await createActiveLottery()

    console.log('✅ SQLite database initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
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
export async function query(sql: string, params: any[] = []) {
  const database = await getDatabase()
  const all = dbAll(database)
  return await all(sql, params)
}

// Función para obtener un registro
export async function getOne(sql: string, params: any[] = []) {
  const database = await getDatabase()
  const get = dbGet(database)
  return await get(sql, params)
}

// Función para ejecutar una consulta
export async function run(sql: string, params: any[] = []) {
  const database = await getDatabase()
  const runQuery = dbRun(database)
  return await runQuery(sql, params)
}
