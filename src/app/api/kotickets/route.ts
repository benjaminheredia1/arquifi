import { NextRequest, NextResponse } from 'next/server'
import { getKoTickets, insertData, verifedNoRepeatTickets } from '@/lib/supabase'
import { initializeDatabase, query } from '@/lib/database-sqlite'

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

    // Inicializar base de datos SQLite
    await initializeDatabase()

    // Get user KoTickets from SQLite
    const userKoTickets = await query('SELECT * FROM kotickets WHERE user_id = ? ORDER BY purchase_time DESC', [parseInt(userId)])

    // Mapear los KoTickets para incluir timestamp
    const mappedKoTickets = userKoTickets.map(koticket => ({
      ...koticket,
      owner: koticket.user_id, // Mapear user_id a owner para el frontend
      purchaseTime: new Date(koticket.purchase_time).getTime() / 1000, // Convertir a timestamp
      isScratched: Boolean(koticket.is_scratched),
      prizeAmount: koticket.prize_amount || 0,
      scratchDate: koticket.scratch_date
    }))

    console.log(`[KoTickets GET] User ${userId} has ${mappedKoTickets.length} KoTickets`)

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
      return NextResponse.json({ success: false, error: 'User ID and quantity are required' }, { status: 400 })
    }

    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json({ success: false, error: 'Invalid userId' }, { status: 400 })
    }

    await initializeDatabase()

    // Verificar usuario vía Supabase (fuente de verdad de usuarios)
    const { getUsers } = await import('@/lib/supabase')
    const users = await getUsers('id', [userIdNum])
    if (!users[0]) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    const created: any[] = []
    for (let i = 0; i < quantity; i++) {
      const nowIso = new Date().toISOString()
      await query(
        'INSERT INTO kotickets (user_id, purchase_time, is_scratched, prize_amount, price) VALUES (?,?,?,?,?)',
        [userIdNum, nowIso, 0, 0, 0]
      )
      const row = await query(
        'SELECT * FROM kotickets WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [userIdNum]
      )
      if (row[0]) created.push(row[0])
    }

    return NextResponse.json({
      success: true,
      data: {
        kotickets: created.map(k => ({
          ...k,
          owner: k.user_id,
          purchaseTime: new Date(k.purchase_time).getTime() / 1000,
          isScratched: Boolean(k.is_scratched),
          prizeAmount: k.prize_amount
        })),
        message: `${quantity} KoTicket${quantity > 1 ? 's' : ''} gratis generado${quantity > 1 ? 's' : ''}`
      }
    })
  } catch (error) {
    console.error('[KoTickets POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
