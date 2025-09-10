import { NextRequest, NextResponse } from 'next/server'
import { getKoTickets, insertData } from '@/lib/supabase'

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
    console.log('🔍 Obteniendo KoTickets para usuario:', userId)
    const allKoTickets = await getKoTickets()
    console.log('📋 Todos los KoTickets:', allKoTickets)
    const userKoTickets = allKoTickets.filter(koticket => koticket.user_id === parseInt(userId))
    console.log('🎫 KoTickets del usuario:', userKoTickets)

    // Mapear los KoTickets para incluir timestamp
    const mappedKoTickets = userKoTickets.map(koticket => ({
      ...koticket,
      owner: koticket.user_id, // Mapear user_id a owner para el frontend
      purchaseTime: new Date(koticket.purchase_time).getTime() / 1000, // Convertir a timestamp
      isScratched: koticket.is_scratched,
      prizeAmount: koticket.prize_amount,
      scratchDate: koticket.scratch_date
    }))
    console.log('🎯 KoTickets mapeados:', mappedKoTickets)

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

    // Verificar que el usuario existe (sin restricción de balance)
    const { getUsers } = await import('@/lib/supabase')
    const users = await getUsers('id', [parseInt(userId)])
    const user = users[0] || null
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 400 }
      )
    }

    // Create KoTickets (GRATIS)
    const kotickets = []
    const allKoTickets = await getKoTickets()
    const maxId = allKoTickets.length > 0 ? Math.max(...allKoTickets.map(kt => kt.id)) : 0
    
    for (let i = 0; i < quantity; i++) {
      const nextId = maxId + i + 1
      const newKoTicketData = {
        id: nextId,
        user_id: parseInt(userId),
        price: 0, // Precio 0 = GRATIS
        is_scratched: false,
        prize_amount: 0,
        purchase_time: new Date().toISOString()
      }
      
      console.log('🎫 Creando KoTicket con ID:', nextId, 'para usuario:', userId)
      const result = await insertData('kotickets', newKoTicketData)
      kotickets.push(result[0])
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
