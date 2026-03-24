import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/brandior',
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message)
})
