import { NextRequest, NextResponse } from 'next/server'
import { getKoTickets, createKoTicket, scratchKoTicket } from '@/lib/database-config'

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

    // Obtener KoTickets del usuario usando función específica de Supabase
    const userKoTickets = await getKoTickets(parseInt(userId))

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

    // Verificar usuario usando función específica
    const { getUserById } = await import('@/lib/database-config')
    const user = await getUserById(userIdNum)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    const created: any[] = []
    for (let i = 0; i < quantity; i++) {
      const success = await createKoTicket(userIdNum)
      if (success) {
        created.push({
          id: Date.now() + i, // ID temporal
          user_id: userIdNum,
          purchase_time: new Date().toISOString(),
          is_scratched: false,
          prize_amount: 0,
          price: 0
        })
      }
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
