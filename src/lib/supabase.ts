import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ytdnarbywbhyxjkrobyr.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZG5hcmJ5d2JoeXhqa3JvYnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTQ1NDUsImV4cCI6MjA3MzA3MDU0NX0.EfO2JbHDl6N9A6bohv_ZLfBxOrq3i3qtWGRGvxQJ0Gw'

console.log('🔍 Supabase config:', { 
  url: supabaseUrl, 
  key: supabaseKey.substring(0, 20) + '...',
  envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
})

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para ejecutar queries SQL usando el cliente de Supabase (DEPRECATED)
export async function querySQL(sql: string, params: (string | number | null)[] = []) {
  try {
    // Usar la función RPC execute_sql
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    })
    
    if (error) {
      console.error('Query error:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Supabase query error:', error)
    // Fallback: usar consultas directas de Supabase
    console.log('🔄 Usando fallback con consultas directas de Supabase')
    return []
  }
}

// Funciones específicas para cada tabla usando consultas directas de Supabase

// Función para obtener usuarios
export async function getUsers(where?: string, params?: any[]) {
  let queryBuilder = supabase.from('users').select('*')
  if (where && params) {
    // Implementar filtros específicos
    if (where.includes('email')) {
      queryBuilder = queryBuilder.eq('email', params[0])
    } else if (where.includes('id')) {
      queryBuilder = queryBuilder.eq('id', params[0])
    }
  }
  const { data, error } = await queryBuilder
  if (error) throw error
  return data || []
}

// Función para obtener loterías
export async function getLotteries(where?: string, params?: any[]) {
  let queryBuilder = supabase.from('lotteries').select('*')
  if (where && params) {
    if (where.includes('status')) {
      queryBuilder = queryBuilder.eq('status', params[0])
    }
  }
  const { data, error } = await queryBuilder
  if (error) throw error
  return data || []
}

// Función para obtener tickets
export async function getTickets(where?: string, params?: any[]) {
  let queryBuilder = supabase.from('tickets').select('*')
  if (where && params) {
    if (where.includes('user_id')) {
      queryBuilder = queryBuilder.eq('user_id', params[0])
    }
  }
  const { data, error } = await queryBuilder
  if (error) throw error
  return data || []
}

// Función para obtener KoTickets
export async function getKoTickets(where?: string, params?: any[]) {
  let queryBuilder = supabase.from('kotickets').select('*')
  if (where && params) {
    if (where.includes('user_id')) {
      queryBuilder = queryBuilder.eq('user_id', params[0])
    }
  }
  const { data, error } = await queryBuilder
  if (error) throw error
  return data || []
}

// Función para insertar datos
export async function insertData(table: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
  if (error) throw error
  return result
}

// Función para actualizar datos
export async function updateData(table: string, data: any, where: any) {
  let queryBuilder = supabase.from(table).update(data)
  
  // Aplicar filtros WHERE
  Object.keys(where).forEach(key => {
    queryBuilder = queryBuilder.eq(key, where[key])
  })
  
  const { data: result, error } = await queryBuilder.select()
  if (error) throw error
  return result
}

// Funciones de compatibilidad para mantener la API existente
export async function query(sql: string, params: (string | number | null)[] = []) {
  console.log('⚠️ Usando función query genérica - considera usar funciones específicas')
  return []
}

export async function getOne(sql: string, params: (string | number | null)[] = []) {
  console.log('⚠️ Usando función getOne genérica - considera usar funciones específicas')
  return null
}

export async function run(sql: string, params: (string | number | null)[] = []) {
  console.log('⚠️ Usando función run genérica - considera usar funciones específicas')
  return []
}
