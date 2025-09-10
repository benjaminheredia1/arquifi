import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database-optimized'

export async function GET(request: NextRequest) {
  try {
    console.log('Getting lottery history...')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Obtener todas las loterías (completadas y activas)
    const allLotteries = await query(`
      SELECT * FROM lotteries 
      ORDER BY created_at DESC
    `)
    
    console.log('Found lotteries:', allLotteries.length)

    // Si no hay loterías, crear una de ejemplo
    if (allLotteries.length === 0) {
      console.log('No lotteries found, creating sample...')
      await query(`
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
      
      // Obtener loterías actualizadas
      const updatedLotteries = await query(`
        SELECT * FROM lotteries 
        ORDER BY created_at DESC
      `)
      
      console.log('Created sample lottery, total now:', updatedLotteries.length)
      
      // Paginación
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedLotteries = (updatedLotteries || []).slice(startIndex, endIndex)

      return NextResponse.json({
        success: true,
        data: {
          lotteries: paginatedLotteries,
          pagination: {
            page,
            limit,
            total: (updatedLotteries || []).length,
            totalPages: Math.ceil((updatedLotteries || []).length / limit)
          }
        }
      })
    }

    // Paginación
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLotteries = (allLotteries || []).slice(startIndex, endIndex)

    console.log('Returning lotteries:', paginatedLotteries.length)

    return NextResponse.json({
      success: true,
      data: {
        lotteries: paginatedLotteries,
        pagination: {
          page,
          limit,
          total: (allLotteries || []).length,
          totalPages: Math.ceil((allLotteries || []).length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get lottery history error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
