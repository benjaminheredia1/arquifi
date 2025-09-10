import { NextRequest, NextResponse } from 'next/server'
import { getOne } from '@/lib/database-sqlite'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y password son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario en la base de datos SQLite
    const user = await getOne('SELECT * FROM users WHERE email = ?', [email])

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado. Regístrate primero.' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Remove password from response and map fields
    const { password: _, ...userWithoutPassword } = user

    // Mapear campos de la base de datos al frontend
    const mappedUser = {
      id: userWithoutPassword.id.toString(),
      fid: userWithoutPassword.fid,
      username: userWithoutPassword.username,
      email: userWithoutPassword.email,
      displayName: userWithoutPassword.display_name || userWithoutPassword.username,
      pfpUrl: userWithoutPassword.pfp_url || '',
      address: userWithoutPassword.address || '',
      balance: userWithoutPassword.balance?.toString() || '0',
      ticketsCount: userWithoutPassword.tickets_count || 0,
      totalSpent: userWithoutPassword.total_spent?.toString() || '0',
      joinedAt: userWithoutPassword.joined_at || new Date().toISOString(),
      isVerified: Boolean(userWithoutPassword.is_verified)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: mappedUser,
        message: 'Login exitoso'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
