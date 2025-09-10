import { connect } from '@planetscale/database'

// Configuración de PlanetScale
const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
}

// Crear conexión
const conn = connect(config)

// Funciones de base de datos
export async function query(sql: string, params: any[] = []) {
  try {
    const result = await conn.execute(sql, params)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getOne(sql: string, params: any[] = []) {
  try {
    const result = await conn.execute(sql, params)
    return result.rows[0] || null
  } catch (error) {
    console.error('Database getOne error:', error)
    throw error
  }
}

export async function run(sql: string, params: any[] = []) {
  try {
    const result = await conn.execute(sql, params)
    return result
  } catch (error) {
    console.error('Database run error:', error)
    throw error
  }
}

// Inicializar base de datos
export async function initializeDatabase() {
  try {
    // Crear tabla de usuarios
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fid INT UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        pfp_url TEXT,
        address VARCHAR(255),
        balance DECIMAL(10,2) DEFAULT 0,
        tickets_count INT DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de loterías
    await run(`
      CREATE TABLE IF NOT EXISTS lotteries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        ticket_price DECIMAL(10,2) DEFAULT 10,
        total_tickets INT DEFAULT 0,
        total_pool DECIMAL(10,2) DEFAULT 0,
        winning_numbers JSON,
        winners JSON,
        is_active BOOLEAN DEFAULT TRUE,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de tickets
    await run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lottery_id INT,
        number INT NOT NULL,
        owner_id INT,
        purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_winner BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lottery_id) REFERENCES lotteries(id),
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `)

    // Crear tabla de KoTickets
    await run(`
      CREATE TABLE IF NOT EXISTS kotickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT,
        purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_scratched BOOLEAN DEFAULT FALSE,
        prize DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `)

    // Crear tabla de transacciones
    await run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'completed',
        lottery_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lottery_id) REFERENCES lotteries(id)
      )
    `)

    console.log('✅ PlanetScale database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
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
