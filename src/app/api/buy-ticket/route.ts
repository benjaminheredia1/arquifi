import { NextRequest, NextResponse } from 'next/server'
import { getUsers, getLotteries, getTickets, insertData, updateData } from '@/lib/supabase'
import { processTicketPurchaseWithKoki, getUserKokiBalance } from '@/lib/database-config'

export async function POST(request: NextRequest) {
  try {
    const { number, userId } = await request.json()
    console.log(`[Buy Ticket] Request: number=${number}, userId=${userId}`)

    if (!number || !userId) {
      console.log(`[Buy Ticket] Error: Missing required fields`)
      return NextResponse.json({ success: false, error: 'Número y ID de usuario requeridos' }, { status: 400 })
    }
    if (number < 1 || number > 50) {
      console.log(`[Buy Ticket] Error: Invalid number range: ${number}`)
      return NextResponse.json({ success: false, error: 'Número debe estar entre 1 y 50' }, { status: 400 })
    }

    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      console.log(`[Buy Ticket] Error: Invalid userId: ${userId}`)
      return NextResponse.json({ success: false, error: 'User ID inválido' }, { status: 400 })
    }

    console.log(`[Buy Ticket] Fetching users for userId: ${userIdNum}`)
    const users = await getUsers('id', [userIdNum])
    const user = users[0]
    if (!user) {
      console.log(`[Buy Ticket] Error: User not found for id: ${userIdNum}`)
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log(`[Buy Ticket] User found: ${user.username}, balance: ${user.balance}`)
    const ticketPrice = 10
    if (user.balance < ticketPrice) {
      console.log(`[Buy Ticket] Error: Insufficient balance: ${user.balance} < ${ticketPrice}`)
      return NextResponse.json({ success: false, error: 'Balance insuficiente' }, { status: 400 })
    }

    console.log(`[Buy Ticket] Fetching active lotteries`)
    const lotteries = await getLotteries('status', ['active'])
    const activeLottery = lotteries[0]
    if (!activeLottery) {
      console.log(`[Buy Ticket] Error: No active lottery found`)
      return NextResponse.json({ success: false, error: 'No hay lotería activa' }, { status: 400 })
    }

    console.log(`[Buy Ticket] Active lottery: ${activeLottery.id}, checking for taken numbers`)
    const allTickets = await getTickets()
    const taken = allTickets.find(t => t.lottery_id === activeLottery.id && t.number === number)
    if (taken) {
      console.log(`[Buy Ticket] Error: Number ${number} already taken in lottery ${activeLottery.id}`)
      return NextResponse.json({ success: false, error: 'Este número ya está comprado' }, { status: 400 })
    }

    const maxId = allTickets.length > 0 ? Math.max(...allTickets.map(t => t.id)) : 0
    const nextId = maxId + 1

    await insertData('tickets', {
      id: nextId,
      user_id: userIdNum,
      lottery_id: activeLottery.id,
      number,
      price: ticketPrice
    })

    await updateData('users', {
      balance: user.balance - ticketPrice,
      tickets_count: user.tickets_count + 1,
      total_spent: user.total_spent + ticketPrice
    }, { id: userIdNum })

    await updateData('lotteries', {
      total_pool: activeLottery.total_pool + ticketPrice
    }, { id: activeLottery.id })

    try {
      await processTicketPurchaseWithKoki(userIdNum, ticketPrice, nextId)
      console.log(`✅ KOKI points awarded for ticket purchase to user ${userIdNum}`)
    } catch (err) {
      console.error('Error awarding KOKI points:', err)
    }

    const kokiBalance = await getUserKokiBalance(userIdNum)
    const refreshedUsers = await getUsers('id', [userIdNum])
    const refreshed = refreshedUsers[0]

    const mappedUser = {
      id: refreshed.id.toString(),
      fid: refreshed.fid,
      username: refreshed.username,
      email: refreshed.email,
      displayName: refreshed.display_name,
      pfpUrl: refreshed.pfp_url,
      address: refreshed.address,
      balance: refreshed.balance.toString(),
      ticketsCount: refreshed.tickets_count,
      totalSpent: refreshed.total_spent.toString(),
      joinedAt: refreshed.joined_at,
      isVerified: Boolean(refreshed.is_verified),
      kokiPoints: kokiBalance
    }

    return NextResponse.json({
      success: true,
      data: {
        ticket: { id: nextId, number, price: ticketPrice, lotteryId: activeLottery.id },
        user: mappedUser,
        kokiBalance,
        price: ticketPrice,
        message: `¡Ticket #${number} comprado exitosamente por ${ticketPrice} KOKI!`
      }
    })
  } catch (error) {
    console.error('Error buying ticket:', error)
    return NextResponse.json({ success: false, error: 'Error al comprar ticket' }, { status: 500 })
  }
}
