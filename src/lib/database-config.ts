// Configuración automática de base de datos basada en el ambiente
// En desarrollo usa SQLite, en producción usa Supabase

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

// Importaciones condicionales
let databaseModule: any

if (isProduction) {
  // En producción, usar Supabase
  console.log('🔄 Using Supabase database (production)')
  databaseModule = require('./database-supabase')
} else {
  // En desarrollo, usar SQLite
  console.log('🔄 Using SQLite database (development)')
  databaseModule = require('./database-sqlite')
}

// Re-exportar todas las funciones del módulo seleccionado
export const {
  initializeDatabase,
  query,
  getOne,
  run,
  getUserKokiBalance,
  getUserKokiTransactions,
  canUserPlayRoulette,
  getSystemConfig,
  addKokiPoints,
  spendKokiPoints,
  processTicketPurchaseWithKoki,
  scratchKoTicket,
  getKoTickets,
  createKoTicket,
  getKoTicketById,
  updateKoTicketScratch,
  updateUserBalance,
  getUserById,
  createUser,
  authenticateUser,
  getActiveLottery,
  getLotteryHistory,
  getUserTickets,
  createTicket,
  getLotteryStats,
  processRoulettePlay,
  getRouletteConfig,
  createWeeklyFund,
  insertInitialSystemConfig,
  createDemoUser,
  createActiveLottery,
  createSampleCompletedLotteries
} = databaseModule

// Log del ambiente detectado
console.log(`Database environment: ${isProduction ? 'PRODUCTION (Supabase)' : 'DEVELOPMENT (SQLite)'}`)