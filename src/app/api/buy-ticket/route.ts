import { NextRequest, NextResponse } from 'next/server'
import { getUsers, getLotteries, getTickets, insertData, updateData } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { number, userId } = await request.json()

    if (!number || !userId) {
      return NextResponse.json(
        { success: false, error: 'Número y ID de usuario requeridos' },
        { status: 400 }
      )
    }

    if (number < 1 || number > 50) {
      return NextResponse.json(
        { success: false, error: 'Número debe estar entre 1 y 50' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const users = await getUsers('id', [parseInt(userId)])
    const user = users[0] || null
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario tiene suficiente balance
    const ticketPrice = 10
    if (user.balance < ticketPrice) {
      return NextResponse.json(
        { success: false, error: 'Balance insuficiente' },
        { status: 400 }
      )
    }

    // Verificar que el número no esté ya comprado en la lotería activa
    const lotteries = await getLotteries('status', ['active'])
    const activeLottery = lotteries[0] || null
    if (!activeLottery) {
      return NextResponse.json(
        { success: false, error: 'No hay lotería activa' },
        { status: 400 }
      )
    }

    // Verificar si el número ya está comprado (necesitamos una función más específica)
    const allTickets = await getTickets()
    const existingTicket = allTickets.find(ticket => 
      ticket.lottery_id === activeLottery.id && ticket.number === number
    )

    if (existingTicket) {
      return NextResponse.json(
        { success: false, error: 'Este número ya está comprado' },
        { status: 400 }
      )
    }

    // Obtener el siguiente ID disponible para tickets
    const allTicketsForId = await getTickets()
    const maxId = allTicketsForId.length > 0 ? Math.max(...allTicketsForId.map(t => t.id)) : 0
    const nextId = maxId + 1

    // Comprar ticket con ID específico para evitar conflictos
    await insertData('tickets', {
      id: nextId,
      user_id: parseInt(userId),
      lottery_id: activeLottery.id,
      number: number,
      price: ticketPrice
    })

    // Actualizar balance del usuario
    await updateData('users', {
      balance: user.balance - ticketPrice,
      tickets_count: user.tickets_count + 1,
      total_spent: user.total_spent + ticketPrice
    }, { id: parseInt(userId) })

    // Actualizar pool de la lotería
    await updateData('lotteries', {
      total_pool: activeLottery.total_pool + ticketPrice
    }, { id: activeLottery.id })

    // Obtener usuario actualizado
    const updatedUsers = await getUsers('id', [parseInt(userId)])
    const updatedUser = updatedUsers[0]

    // Mapear datos del usuario para el frontend
    const mappedUser = {
      id: updatedUser.id.toString(),
      fid: updatedUser.fid,
      username: updatedUser.username,
      email: updatedUser.email,
      displayName: updatedUser.display_name,
      pfpUrl: updatedUser.pfp_url,
      address: updatedUser.address,
      balance: updatedUser.balance.toString(),
      ticketsCount: updatedUser.tickets_count,
      totalSpent: updatedUser.total_spent.toString(),
      joinedAt: updatedUser.joined_at,
      isVerified: Boolean(updatedUser.is_verified)
    }

    return NextResponse.json({
      success: true,
      data: {
        ticket: {
          id: Date.now(),
          number: number,
          price: ticketPrice,
          lotteryId: activeLottery.id
        },
        user: mappedUser,
        price: ticketPrice,
        message: `¡Ticket #${number} comprado exitosamente por ${ticketPrice} KOKI!`
      }
    })

  } catch (error) {
    console.error('Error buying ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Error al comprar ticket' },
      { status: 500 }
    )
  }
}
