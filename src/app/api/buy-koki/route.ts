import { NextRequest, NextResponse } from 'next/server'
import { getUsers, updateData } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Buy KOKI request received')
    const { userId, amount } = await request.json()
    console.log('Request data:', { userId, amount, userIdType: typeof userId, amountType: typeof amount })

    if (!userId || !amount) {
      console.log('Missing parameters:', { userId, amount })
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    console.log('Looking for user with ID:', userId)
    const users = await getUsers('id', [parseInt(userId)])
    const user = users[0] || null
    console.log('User found:', user ? 'Yes' : 'No', user ? `ID: ${user.id}, Balance: ${user.balance}` : '')
    if (!user) {
      console.log('User not found for ID:', userId)
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calcular bonus basado en la cantidad
    let bonus = 0
    if (amount >= 1000) bonus = 150
    else if (amount >= 500) bonus = 50
    else if (amount >= 100) bonus = 10

    const totalAmount = amount + bonus
    console.log('Bonus calculation:', { amount, bonus, totalAmount })

    // Actualizar el balance del usuario
    const newBalance = user.balance + totalAmount
    console.log('Balance update:', { currentBalance: user.balance, totalAmount, newBalance })
    await updateData('users', { balance: newBalance }, { id: parseInt(userId) })
    console.log('Balance updated successfully')

    // Registrar la transacción
    const description = bonus > 0 
      ? `Compra de ${amount} KOKI + ${bonus} bonus = ${totalAmount} KOKI`
      : `Compra de ${amount} KOKI`
    
    console.log('Creating transaction:', { userId, type: 'deposit', amount: totalAmount, description })
    // Nota: Por ahora saltamos la creación de transacciones ya que no tenemos la tabla configurada
    // await insertData('transactions', { user_id: parseInt(userId), type: 'deposit', amount: totalAmount, description, status: 'completed' })
    console.log('Transaction creation skipped (table not configured)')

    // Obtener el usuario actualizado
    const updatedUsers = await getUsers('id', [parseInt(userId)])
    const updatedUser = updatedUsers[0] || null
    console.log('Updated user:', updatedUser ? `ID: ${updatedUser.id}, Balance: ${updatedUser.balance}` : 'Not found')

    // Mapear campos de la base de datos al frontend
    const mappedUser = {
      id: updatedUser.id.toString(),
      fid: updatedUser.fid,
      username: updatedUser.username,
      email: updatedUser.email,
      displayName: updatedUser.display_name || updatedUser.username,
      pfpUrl: updatedUser.pfp_url || '',
      address: updatedUser.address || '',
      balance: updatedUser.balance?.toString() || '0',
      ticketsCount: updatedUser.tickets_count || 0,
      totalSpent: updatedUser.total_spent?.toString() || '0',
      joinedAt: updatedUser.joined_at || new Date().toISOString(),
      isVerified: Boolean(updatedUser.is_verified)
    }

    const response = {
      success: true,
      data: {
        user: mappedUser,
        message: bonus > 0 
          ? `¡${totalAmount} KOKI agregados exitosamente! (${amount} + ${bonus} bonus)`
          : `¡${totalAmount} KOKI agregados exitosamente!`
      }
    }
    console.log('Returning success response:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error buying KOKI:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
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