import { NextRequest, NextResponse } from 'next/server'
import { getOne, run } from '@/lib/database-optimized'
import { generateScratchPrize } from '@/lib/lottery-system'

export async function POST(request: NextRequest) {
  try {
    const { userId, koticketId } = await request.json()

    if (!userId || !koticketId) {
      return NextResponse.json(
        { success: false, error: 'User ID y KoTicket ID son requeridos' },
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

    // Verificar que el KoTicket existe y pertenece al usuario
    const koticket = await getOne('SELECT * FROM kotickets WHERE id = ? AND user_id = ?', [koticketId, userId])
    if (!koticket) {
      return NextResponse.json(
        { success: false, error: 'KoTicket no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el KoTicket no ha sido rascado
    if (koticket.is_scratched) {
      return NextResponse.json(
        { success: false, error: 'Este KoTicket ya ha sido rascado' },
        { status: 400 }
      )
    }

    // Generar premio
    const prize = generateScratchPrize()
    const prizeAmount = prize.type === 'koki' ? prize.amount : 0

    // Actualizar el KoTicket como rascado
    await run(`
      UPDATE kotickets 
      SET is_scratched = 1, prize_amount = ?, scratch_date = datetime('now')
      WHERE id = ?
    `, [prizeAmount, koticketId])

    // Actualizar el balance del usuario si ganó algo
    if (prizeAmount > 0) {
      const newBalance = user.balance + prizeAmount
      await run('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId])

      // Registrar la transacción
      await run(`
        INSERT INTO transactions (user_id, type, amount, description, status)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, 'win', prizeAmount, `Premio de KoTicket: ${prizeAmount} KOKI`, 'completed'])
    }

    // Obtener el usuario actualizado
    const updatedUser = await getOne('SELECT * FROM users WHERE id = ?', [userId])

    return NextResponse.json({
      success: true,
      data: {
        prize: {
          type: prize.type,
          amount: prizeAmount,
          message: prizeAmount > 0 ? `¡Ganaste ${prizeAmount} KOKI!` : '¡Mejor suerte la próxima vez!'
        },
        user: updatedUser
      }
    })

  } catch (error) {
    console.error('Error scratching KoTicket:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
