import { NextRequest, NextResponse } from 'next/server'
import { getUsers, getKoTickets, updateData } from '@/lib/supabase'
import { generateScratchPrize } from '@/lib/lottery-system'

export async function POST(request: NextRequest) {
  try {
    const { userId, koticketId } = await request.json()
    console.log('🎫 Scratch request:', { userId, koticketId })

    if (!userId || !koticketId) {
      console.log('❌ Missing userId or koticketId')
      return NextResponse.json(
        { success: false, error: 'User ID y KoTicket ID son requeridos' },
        { status: 400 }
      )
    }

    // Convertir userId a número
    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: 'User ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const users = await getUsers('id', [userIdNum])
    const user = users[0] || null
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el KoTicket existe y pertenece al usuario
    const allKoTickets = await getKoTickets()
    const koticket = allKoTickets.find(kt => kt.id === parseInt(koticketId) && kt.user_id === userIdNum)
    console.log('🔍 KoTicket encontrado:', koticket)
    
    if (!koticket) {
      console.log('❌ KoTicket no encontrado')
      return NextResponse.json(
        { success: false, error: 'KoTicket no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el KoTicket no ha sido rascado
    if (koticket.is_scratched) {
      console.log('❌ KoTicket ya rascado:', koticket.is_scratched)
      return NextResponse.json(
        { success: false, error: 'Este KoTicket ya ha sido rascado' },
        { status: 400 }
      )
    }

    // Generar premio
    const prize = generateScratchPrize()
    const prizeAmount = prize.type === 'koki' ? prize.amount : 0

    // Actualizar el KoTicket como rascado
    await updateData('kotickets', {
      is_scratched: true,
      prize_amount: prizeAmount,
      scratch_date: new Date().toISOString()
    }, { id: parseInt(koticketId) })

    // Actualizar el balance del usuario si ganó algo
    if (prizeAmount > 0) {
      const newBalance = user.balance + prizeAmount
      await updateData('users', { balance: newBalance }, { id: userIdNum })

      // Registrar la transacción (comentado por ahora)
      // await insertData('transactions', {
      //   user_id: userIdNum,
      //   type: 'win',
      //   amount: prizeAmount,
      //   description: `Premio de KoTicket: ${prizeAmount} KOKI`,
      //   status: 'completed'
      // })
    }

    // Obtener el usuario actualizado
    const updatedUsers = await getUsers('id', [userIdNum])
    const updatedUser = updatedUsers[0] || null

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

