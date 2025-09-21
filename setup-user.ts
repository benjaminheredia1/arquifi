// Script temporal para verificar y crear usuario en Supabase
import { getUsers, insertData, getLotteries } from '@/lib/supabase'

async function setupUserAndLottery() {
  try {
    console.log('🔍 Checking user 7 in Supabase...')
    const users = await getUsers('id', [7])
    console.log('Users found:', users)
    
    if (users.length === 0) {
      console.log('📝 Creating user 7 in Supabase...')
      await insertData('users', {
        id: 7,
        username: 'test_user_7',
        email: 'user7@kokifi.com',
        password: 'dummy_password',
        balance: 100.0,
        tickets_count: 0,
        total_spent: 0,
        joined_at: new Date().toISOString(),
        is_verified: false
      })
      console.log('✅ User 7 created in Supabase')
    } else {
      console.log('👤 User 7 exists in Supabase:', users[0])
      if (users[0].balance < 10) {
        console.log('💰 Updating balance...')
        // Update balance if needed
      }
    }
    
    console.log('🎲 Checking active lotteries...')
    const lotteries = await getLotteries('status', ['active'])
    console.log('Active lotteries:', lotteries)
    
    if (lotteries.length === 0) {
      console.log('📝 Creating active lottery...')
      await insertData('lotteries', {
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_pool: 0,
        ticket_price: 10,
        total_tickets: 0
      })
      console.log('✅ Active lottery created')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

export default setupUserAndLottery