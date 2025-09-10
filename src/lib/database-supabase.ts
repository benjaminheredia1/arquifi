import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Funciones de base de datos
export async function query(sql: string, params: any[] = []) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    })
    
    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getOne(sql: string, params: any[] = []) {
  try {
    const { data, error } = await supabase.rpc('execute_sql_one', {
      query: sql,
      params: params
    })
    
    if (error) {
      console.error('Supabase getOne error:', error)
      throw error
    }
    
    return data || null
  } catch (error) {
    console.error('Database getOne error:', error)
    throw error
  }
}

export async function run(sql: string, params: any[] = []) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    })
    
    if (error) {
      console.error('Supabase run error:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Database run error:', error)
    throw error
  }
}

// Inicializar base de datos
export async function initializeDatabase() {
  try {
    // Crear tabla de usuarios
    const { error: usersError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          fid INTEGER UNIQUE,
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          display_name VARCHAR(255),
          pfp_url TEXT,
          address VARCHAR(255),
          balance DECIMAL(10,2) DEFAULT 0,
          tickets_count INTEGER DEFAULT 0,
          total_spent DECIMAL(10,2) DEFAULT 0,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    })

    if (usersError) {
      console.error('Error creating users table:', usersError)
    }

    // Crear tabla de loterías
    const { error: lotteriesError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS lotteries (
          id SERIAL PRIMARY KEY,
          start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP,
          ticket_price DECIMAL(10,2) DEFAULT 10,
          total_tickets INTEGER DEFAULT 0,
          total_pool DECIMAL(10,2) DEFAULT 0,
          winning_numbers JSONB,
          winners JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    })

    if (lotteriesError) {
      console.error('Error creating lotteries table:', lotteriesError)
    }

    // Crear tabla de tickets
    const { error: ticketsError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          lottery_id INTEGER,
          number INTEGER NOT NULL,
          owner_id INTEGER,
          purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_winner BOOLEAN DEFAULT FALSE,
          price DECIMAL(10,2) DEFAULT 10,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (lottery_id) REFERENCES lotteries(id),
          FOREIGN KEY (owner_id) REFERENCES users(id)
        )
      `
    })

    if (ticketsError) {
      console.error('Error creating tickets table:', ticketsError)
    }

    // Crear tabla de KoTickets
    const { error: koticketsError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS kotickets (
          id SERIAL PRIMARY KEY,
          owner_id INTEGER,
          purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_scratched BOOLEAN DEFAULT FALSE,
          prize DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_id) REFERENCES users(id)
        )
      `
    })

    if (koticketsError) {
      console.error('Error creating kotickets table:', koticketsError)
    }

    // Crear tabla de transacciones
    const { error: transactionsError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          type VARCHAR(50) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'completed',
          lottery_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (lottery_id) REFERENCES lotteries(id)
        )
      `
    })

    if (transactionsError) {
      console.error('Error creating transactions table:', transactionsError)
    }

    console.log('✅ Supabase database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
}

// Crear usuario demo
export async function createDemoUser() {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo1@kokifi.com')
      .single()

    if (!existingUser) {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            fid: 12345,
            username: 'demo1',
            email: 'demo1@kokifi.com',
            password: 'demo123',
            display_name: 'Usuario Demo 1',
            pfp_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo1',
            address: '0x1234567890123456789012345678901234567890',
            balance: 1000,
            tickets_count: 0,
            total_spent: 0,
            is_verified: true
          }
        ])

      if (error) {
        console.error('Error creating demo user:', error)
      } else {
        console.log('✅ Demo user created successfully')
      }
    }
  } catch (error) {
    console.error('❌ Demo user creation error:', error)
  }
}

// Crear lotería activa
export async function createActiveLottery() {
  try {
    const { data: existingLottery } = await supabase
      .from('lotteries')
      .select('*')
      .eq('is_active', true)
      .single()

    if (!existingLottery) {
      const endTime = new Date()
      endTime.setDate(endTime.getDate() + 7) // 7 días desde ahora

      const { error } = await supabase
        .from('lotteries')
        .insert([
          {
            start_time: new Date().toISOString(),
            end_time: endTime.toISOString(),
            ticket_price: 10,
            total_tickets: 0,
            total_pool: 0,
            is_active: true,
            is_completed: false
          }
        ])

      if (error) {
        console.error('Error creating active lottery:', error)
      } else {
        console.log('✅ Active lottery created successfully')
      }
    }
  } catch (error) {
    console.error('❌ Active lottery creation error:', error)
  }
}

// Exportar cliente de Supabase para uso directo
export { supabase }
