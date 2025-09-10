import { NextRequest, NextResponse } from 'next/server'
import { getOne, run } from '@/lib/database-optimized'

export async function POST(request: NextRequest) {
  try {
    const { userId, avatarUrl } = await request.json()
    
    console.log('Change avatar request:', { userId, avatarUrl, userIdType: typeof userId })

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { success: false, error: 'User ID y avatar URL son requeridos' },
        { status: 400 }
      )
    }

    // Convertir userId a número si es string
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId
    console.log('Numeric user ID:', numericUserId)

    // Obtener usuario actual
    const user = await getOne('SELECT * FROM users WHERE id = ?', [numericUserId])
    console.log('User found:', user ? 'Yes' : 'No', user ? `ID: ${user.id}` : '')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar avatar del usuario
    await run('UPDATE users SET pfp_url = ? WHERE id = ?', [avatarUrl, numericUserId])

    // Obtener usuario actualizado
    const updatedUser = await getOne('SELECT * FROM users WHERE id = ?', [numericUserId])

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
