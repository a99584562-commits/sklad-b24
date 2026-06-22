// СКЛАД · backend для VibeCode (standalone Black Hole VM)
// Раздаёт собранный фронт + хранит состояние в JSON-файле (вне зоны деплоя)
// + проксирует нужные вызовы Б24 через VibeCode REST (ключ только на сервере).
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const DATA_DIR = process.env.DATA_DIR || '/opt/skladdata'
const STATE_FILE = path.join(DATA_DIR, 'state.json')
const PUBLIC_DIR = path.join(__dirname, 'public')

const VIBE_BASE = process.env.VIBE_BASE || 'https://vibecode.bitrix24.tech'
const VIBE_KEY = process.env.VIBE_API_KEY || ''

const EMPTY = { categories: [], items: [], warehouses: [], movements: [], acts: [] }

fs.mkdirSync(DATA_DIR, { recursive: true })

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
  } catch {
    return { ...EMPTY }
  }
}
function writeState(state) {
  const tmp = STATE_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(state))
  fs.renameSync(tmp, STATE_FILE) // атомарная запись
}

// вызов Б24 через VibeCode REST
async function vibe(method, endpoint, body) {
  const res = await fetch(`${VIBE_BASE}${endpoint}`, {
    method,
    headers: {
      'X-Api-Key': VIBE_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { ok: res.ok, status: res.status, json }
}

const app = express()
app.use(express.json({ limit: '8mb' }))

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

// ── состояние склада ──────────────────────────────────────────────────────────
app.get('/api/state', (_req, res) => res.json(readState()))
app.put('/api/state', (req, res) => {
  const s = req.body || {}
  // лёгкая валидация формы
  const state = {
    categories: Array.isArray(s.categories) ? s.categories : [],
    items: Array.isArray(s.items) ? s.items : [],
    warehouses: Array.isArray(s.warehouses) ? s.warehouses : [],
    movements: Array.isArray(s.movements) ? s.movements : [],
    acts: Array.isArray(s.acts) ? s.acts : [],
  }
  try {
    writeState(state)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

// ── личность вошедшего пользователя (инжектируется шлюзом Black Hole) ──────────
app.get('/api/me', (req, res) => {
  const uid = req.headers['x-vibe-user-id']
  if (!uid) return res.json({ authenticated: false })
  let name = ''
  try {
    name = decodeURIComponent(req.headers['x-vibe-user-name-encoded'] || '')
  } catch {
    name = ''
  }
  const role = (req.headers['x-vibe-user-role'] || 'MEMBER').toString()
  res.json({
    authenticated: true,
    userId: String(uid),
    name: name || `Пользователь ${uid}`,
    role,
    isAdmin: role.toUpperCase() === 'ADMIN',
  })
})

// ── связь с Б24 ───────────────────────────────────────────────────────────────
app.get('/api/b24/me', async (_req, res) => {
  if (!VIBE_KEY) return res.json({ connected: false })
  const r = await vibe('GET', '/v1/me')
  const portal = r.json?.data?.portal || null
  res.json({ connected: r.ok && !!portal, portal, tariff: r.json?.data?.tariff?.name || null })
})

app.get('/api/b24/users', async (_req, res) => {
  if (!VIBE_KEY) return res.json({ users: [] })
  const r = await vibe('GET', '/v1/users?limit=200')
  const arr = Array.isArray(r.json?.data) ? r.json.data : r.json?.data?.items || []
  const users = arr.map((u) => ({
    id: String(u.ID || u.id),
    name: [u.NAME || u.name, u.LAST_NAME || u.lastName].filter(Boolean).join(' ').trim() || (u.EMAIL || u.email || ('ID ' + (u.ID || u.id))),
  }))
  res.json({ users })
})

// автозадача при списании
app.post('/api/b24/task', async (req, res) => {
  if (!VIBE_KEY) return res.status(400).json({ ok: false, error: 'no key' })
  const { title, description, responsibleId } = req.body || {}
  const fields = { TITLE: title || 'Дозакупка ТМЦ', DESCRIPTION: description || '' }
  if (responsibleId) fields.RESPONSIBLE_ID = responsibleId
  const r = await vibe('POST', '/v1/tasks', { fields })
  res.status(r.ok ? 200 : 502).json({ ok: r.ok, result: r.json })
})

// ── статика фронта + SPA-fallback ─────────────────────────────────────────────
app.use(express.static(PUBLIC_DIR))
app.get('*', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')))

app.listen(PORT, () => console.log(`СКЛАД backend on :${PORT}, data=${DATA_DIR}`))
