import { NextRequest, NextResponse } from 'next/server'
import { getUsers, updateData } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json()

    if (!userId || !amount) {
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
    const users = await getUsers('id', [parseInt(userId)])
    const user = users[0] || null
    if (!user) {
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

    // Actualizar el balance del usuario
    const newBalance = user.balance + totalAmount
    await updateData('users', { balance: newBalance }, { id: parseInt(userId) })

    // Registrar la transacción
    const description = bonus > 0 
      ? `Compra de ${amount} KOKI + ${bonus} bonus = ${totalAmount} KOKI`
      : `Compra de ${amount} KOKI`
    
    // Nota: Por ahora saltamos la creación de transacciones ya que no tenemos la tabla configurada
    // await insertData('transactions', { user_id: parseInt(userId), type: 'deposit', amount: totalAmount, description, status: 'completed' })

    // Obtener el usuario actualizado
    const updatedUsers = await getUsers('id', [parseInt(userId)])
    const updatedUser = updatedUsers[0] || null

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