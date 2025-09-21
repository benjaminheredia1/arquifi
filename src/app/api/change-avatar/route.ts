import { NextRequest, NextResponse } from 'next/server'
import { getUsers, updateData } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, avatarUrl } = await request.json()
    
    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { success: false, error: 'User ID y avatar URL son requeridos' },
        { status: 400 }
      )
    }

    // Convertir userId a número si es string
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId

    // Obtener usuario actual
    const users = await getUsers('id', [numericUserId])
    const user = users[0] || null
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar avatar del usuario
    await updateData('users', { pfp_url: avatarUrl }, { id: numericUserId })

    // Obtener usuario actualizado
    const updatedUsers = await getUsers('id', [numericUserId])
    const updatedUser = updatedUsers[0] || null

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar avatar' },
        { status: 500 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        message: 'Avatar actualizado exitosamente'
      }
    })

  } catch (error) {
    console.error('Change avatar error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
