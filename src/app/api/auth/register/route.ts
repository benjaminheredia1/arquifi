import { NextRequest, NextResponse } from 'next/server'
import { getUsers, insertData } from '@/lib/supabase'

// Lista de avatares con animalitos animados y bonitos
const AVATAR_OPTIONS = [
  'https://cdn-icons-png.flaticon.com/512/1998/1998665.png', // 🐱 Gato animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998664.png', // 🐶 Perro animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998663.png', // 🐰 Conejo animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998662.png', // 🐸 Rana animada
  'https://cdn-icons-png.flaticon.com/512/1998/1998661.png', // 🐧 Pingüino animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998660.png', // 🦊 Zorro animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998659.png', // 🐨 Koala animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998658.png', // 🐼 Panda animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998657.png', // 🦁 León animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998656.png', // 🐯 Tigre animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998655.png', // 🐮 Vaca animada
  'https://cdn-icons-png.flaticon.com/512/1998/1998654.png', // 🐷 Cerdo animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998653.png', // 🐸 Pato animado
  'https://cdn-icons-png.flaticon.com/512/1998/1998652.png', // 🐝 Abeja animada
  'https://cdn-icons-png.flaticon.com/512/1998/1998651.png'  // 🦋 Mariposa animada
]

// Endpoint para obtener avatares disponibles
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      avatars: AVATAR_OPTIONS
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, avatar } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, email y password son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar y seleccionar avatar
    let selectedAvatar = ''
    if (avatar && AVATAR_OPTIONS.includes(avatar)) {
      selectedAvatar = avatar
    } else {
      // Si no se selecciona un avatar válido, usar uno aleatorio
      selectedAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]
    }

    // Verificar si el email ya existe
    const existingUsers = await getUsers('email', [email])
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Generar datos para el usuario
    const fid = Math.floor(Math.random() * 100000) + 10000
    const address = `0x${Math.random().toString(16).substr(2, 40)}`

    // Obtener el siguiente ID disponible para usuarios
    const allUsers = await getUsers()
    const maxId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id)) : 0
    const nextId = maxId + 1

    // Crear nuevo usuario en Supabase con ID específico para evitar conflictos
    const newUserData = {
      id: nextId,
      username,
      email,
      password,
      fid,
      display_name: username,
      pfp_url: selectedAvatar,
      address,
      balance: 1000, // Balance inicial
      tickets_count: 0, // Tickets count
      total_spent: 0, // Total spent
      is_verified: true // Is verified
    }

    const result = await insertData('users', newUserData)

    // Obtener el usuario creado usando el email
    const newUsers = await getUsers('email', [email])
    const newUser = newUsers[0]

    if (!newUser) {
      console.error('Error: Usuario no se pudo crear correctamente')
      return NextResponse.json(
        { success: false, error: 'Error al crear el usuario' },
        { status: 500 }
      )
    }

    // Remove password from response and map fields
    const { password: _, ...userWithoutPassword } = newUser

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
        message: 'Usuario registrado exitosamente. ¡Bienvenido a KokiFi Lottery!'
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    
    // Si es un error de email duplicado, devolver mensaje específico
    if (error instanceof Error && error.message === 'Este email ya está registrado') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
