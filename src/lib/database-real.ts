import { Pool } from 'pg'

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/kokifi_lottery',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export async function getDatabase() {
  return pool
}

// Inicializar tablas
export async function initializeDatabase() {
  const db = await getDatabase()
  
  try {
    // Crear tabla de usuarios
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fid INTEGER UNIQUE,
        display_name VARCHAR(100),
        pfp_url TEXT,
        address VARCHAR(42),
        balance DECIMAL(18, 8) DEFAULT 0,
        tickets_count INTEGER DEFAULT 0,
        total_spent DECIMAL(18, 8) DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT false
      )
    `)

    // Crear tabla de loterías
    await db.query(`
      CREATE TABLE IF NOT EXISTS lotteries (
        id SERIAL PRIMARY KEY,
        status VARCHAR(20) DEFAULT 'active',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
        winning_numbers INTEGER[],
        total_pool DECIMAL(18, 8) DEFAULT 0,
        ticket_price DECIMAL(18, 8) DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de tickets
    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        lottery_id INTEGER REFERENCES lotteries(id),
        number INTEGER NOT NULL,
        price DECIMAL(18, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de transacciones
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(20) NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        description TEXT,
        lottery_id INTEGER REFERENCES lotteries(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de historial de loterías
    await db.query(`
      CREATE TABLE IF NOT EXISTS lottery_history (
        id SERIAL PRIMARY KEY,
        lottery_id INTEGER REFERENCES lotteries(id),
        winning_numbers INTEGER[] NOT NULL,
        total_tickets INTEGER DEFAULT 0,
        total_prize DECIMAL(18, 8) DEFAULT 0,
        winner_address VARCHAR(42),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Database tables initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

// Función para crear usuario demo
export async function createDemoUser() {
  const db = await getDatabase()
  
  try {
    // Verificar si ya existe el usuario demo
    const existingUser = await db.query('SELECT * FROM users WHERE username = $1', ['demo1'])
    
    if (existingUser.rows.length === 0) {
      await db.query(`
        INSERT INTO users (username, email, password, fid, display_name, pfp_url, address, balance, tickets_count, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        'demo1',
        'demo@kokifi.com',
        'demo123',
        12345,
        'Demo User',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        '0x1234567890123456789012345678901234567890',
        1000,
        0,
        true
      ])
      console.log('✅ Demo user created successfully')
    }
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  }
}

// Función para crear lotería activa
export async function createActiveLottery() {
  const db = await getDatabase()
  
  try {
    // Verificar si ya existe una lotería activa
    const existingLottery = await db.query('SELECT * FROM lotteries WHERE status = $1', ['active'])
    
    if (existingLottery.rows.length === 0) {
      await db.query(`
        INSERT INTO lotteries (status, start_date, end_date, ticket_price, total_pool)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'active',
        new Date(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
        10,
        0
      ])
      console.log('✅ Active lottery created successfully')
    }
  } catch (error) {
    console.error('❌ Error creating active lottery:', error)
  }
}
