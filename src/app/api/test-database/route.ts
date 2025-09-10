import { NextRequest, NextResponse } from 'next/server'
import { query, getOne, run, initializeDatabase } from '@/lib/database-optimized'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Inicializar base de datos
    await initializeDatabase()
    console.log('Database initialized')
    
    // Verificar si hay usuarios
    const users = await query('SELECT * FROM users')
    console.log('Users found:', users.length)
    
    // Verificar si hay loterías
    const lotteries = await query('SELECT * FROM lotteries')
    console.log('Lotteries found:', lotteries.length)
    
    // Crear lotería de ejemplo si no existe
    if (lotteries.length === 0) {
      console.log('Creating sample lottery...')
      await run(`
        INSERT INTO lotteries (start_time, end_time, ticket_price, total_tickets, total_pool, is_active, is_completed, winning_numbers, winners)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        10,
        5,
        50,
        false,
        true,
        JSON.stringify([7, 14, 21, 28, 35]),
        JSON.stringify(['demo1@kokifi.com'])
      ])
      console.log('Sample lottery created')
    }
    
    // Obtener datos actualizados
    const updatedLotteries = await query('SELECT * FROM lotteries')
    const updatedUsers = await query('SELECT * FROM users')
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Database test successful',
        users: updatedUsers.length,
        lotteries: updatedLotteries.length,
        sampleData: {
          users: updatedUsers,
          lotteries: updatedLotteries
        }
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
