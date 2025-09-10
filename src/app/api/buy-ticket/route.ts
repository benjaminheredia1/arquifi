import { NextRequest, NextResponse } from 'next/server'
import { query, getOne, run } from '@/lib/database-optimized'

export async function POST(request: NextRequest) {
  try {
    const { number, userId, username } = await request.json()

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
    const user = await getOne('SELECT * FROM users WHERE id = ?', [userId])
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
    const activeLottery = await getOne('SELECT * FROM lotteries WHERE status = ?', ['active'])
    if (!activeLottery) {
      return NextResponse.json(
        { success: false, error: 'No hay lotería activa' },
        { status: 400 }
      )
    }

    const existingTicket = await getOne(
      'SELECT * FROM tickets WHERE lottery_id = ? AND number = ?',
      [activeLottery.id, number]
    )

    if (existingTicket) {
      return NextResponse.json(
        { success: false, error: 'Este número ya está comprado' },
        { status: 400 }
      )
    }

    // Comprar ticket
    await run(
      'INSERT INTO tickets (user_id, lottery_id, number, price) VALUES (?, ?, ?, ?)',
      [userId, activeLottery.id, number, ticketPrice]
    )

    // Actualizar balance del usuario
    await run(
      'UPDATE users SET balance = balance - ?, tickets_count = tickets_count + 1, total_spent = total_spent + ? WHERE id = ?',
      [ticketPrice, ticketPrice, userId]
    )

    // Actualizar pool de la lotería
    await run(
      'UPDATE lotteries SET total_pool = total_pool + ? WHERE id = ?',
      [ticketPrice, activeLottery.id]
    )

    // Obtener usuario actualizado
    const updatedUser = await getOne('SELECT * FROM users WHERE id = ?', [userId])

    return NextResponse.json({
      success: true,
      data: {
        ticket: {
          id: Date.now(),
          number: number,
          price: ticketPrice,
          lotteryId: activeLottery.id
        },
        user: updatedUser,
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
