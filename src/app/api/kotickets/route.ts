import { NextRequest, NextResponse } from 'next/server'
import { query, getOne, run } from '@/lib/database-sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user KoTickets
    const kotickets = await query(
      'SELECT * FROM kotickets WHERE user_id = ? ORDER BY purchase_time DESC',
      [userId]
    )

    // Mapear los KoTickets para incluir timestamp
    const mappedKoTickets = (kotickets || []).map(koticket => ({
      ...koticket,
      purchaseTime: new Date(koticket.purchase_time).getTime() / 1000, // Convertir a timestamp
      isScratched: koticket.is_scratched,
      prizeAmount: koticket.prize_amount,
      scratchDate: koticket.scratch_date
    }))

    return NextResponse.json({
      success: true,
      data: {
        kotickets: mappedKoTickets
      }
    })
  } catch (error) {
    console.error('Error fetching KoTickets:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, quantity } = await request.json()

    if (!userId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'User ID and quantity are required' },
        { status: 400 }
      )
    }

    // Verificar que el usuario tiene al menos 100 KOKI
    const user = await getOne('SELECT * FROM users WHERE id = ?', [userId])
    if (!user || user.balance < 100) {
      return NextResponse.json(
        { success: false, error: 'Necesitas al menos 100 KOKI para acceder al juego de rascar' },
        { status: 400 }
      )
    }

    // Create KoTickets (GRATIS)
    const kotickets = []
    for (let i = 0; i < quantity; i++) {
      await run(`
        INSERT INTO kotickets (user_id, price)
        VALUES (?, ?)
      `, [userId, 0]) // Precio 0 = GRATIS
      
      const newKoTicket = await getOne('SELECT * FROM kotickets WHERE id = last_insert_rowid()')
      kotickets.push(newKoTicket)
    }

    return NextResponse.json({
      success: true,
      data: {
        kotickets,
        message: `${quantity} KoTicket${quantity > 1 ? 's' : ''} obtenido${quantity > 1 ? 's' : ''} GRATIS!`
      }
    })
  } catch (error) {
    console.error('Error creating KoTickets:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
