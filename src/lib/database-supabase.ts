import { supabase, query, getOne, run } from './supabase'

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing Supabase database...')

    // Crear tabla de usuarios
    await run(`
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
    await run(`
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
    await run(`
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
    await run(`
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
    await run(`
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
    const existingUser = await getOne('SELECT * FROM users WHERE username = $1', ['demo1'])
    
    if (!existingUser) {
      await run(`
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
        true
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
    const existingLottery = await getOne('SELECT * FROM lotteries WHERE status = $1', ['active'])
    
    if (!existingLottery) {
      await run(`
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
    const existingLotteries = await getOne('SELECT COUNT(*) as count FROM lotteries WHERE status = $1', ['completed'])
    
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
      await run(`
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

// Exportar funciones para uso en APIs
export { query, getOne, run }
