const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function run() {
  let conn = process.env.SUPABASE_DB_URL
  if (!conn) {
    const apiEnv = path.resolve(__dirname, '../../rs-api/.env')
    const apiEnvExample = path.resolve(__dirname, '../../rs-api/.env.example')
    const candidate = fs.existsSync(apiEnv) ? apiEnv : (fs.existsSync(apiEnvExample) ? apiEnvExample : null)
    if (candidate) {
      const text = fs.readFileSync(candidate, 'utf8')
      const match = text.match(/SUPABASE_DB_URL\s*=\s*(.*)/)
      if (match) conn = match[1].trim()
    }
  }
  if (!conn) {
    console.error('SUPABASE_DB_URL ausente; defina no ambiente ou em rs-api/.env')
    process.exit(1)
  }
  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const dir = path.resolve(__dirname, '../schemas/sigma')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8')
    console.log('Aplicando', f)
    await client.query(sql)
  }
  await client.end()
  console.log('Concluído')
}

run().catch(e => { console.error(e.message); process.exit(1) })
