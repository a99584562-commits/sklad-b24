// Demo dataset for the СКЛАД (off-balance inventory) Bitrix24 app mockup.
// All figures are illustrative. "Today" in the demo is 11.06.2026.

export const TODAY = '2026-06-11'

export const people = [
  { id: 'p1', name: 'Игорь Самойлов', role: 'Кладовщик · Центральный', initials: 'ИС', hue: 158 },
  { id: 'p2', name: 'Марина Котова', role: 'Менеджер проекта', initials: 'МК', hue: 268 },
  { id: 'p3', name: 'Алексей Жданов', role: 'Сервисный инженер', initials: 'АЖ', hue: 28 },
  { id: 'p4', name: 'Дарья Лунёва', role: 'Кладовщик · Объект «Север»', initials: 'ДЛ', hue: 198 },
]

export const personById = (id) => people.find((p) => p.id === id)

// Родительская номенклатура. items — конкретные единицы (инв. номер, зав. номер и т.д.)
// Это СИД для стора: при инициализации items разворачиваются в плоский список.
export const seedCategories = [
  {
    id: 'tv43',
    title: 'ТВ-панель 43"',
    group: 'Видеотехника',
    emoji: '📺',
    hue: 210,
    warrantyMonths: 24,
    items: [
      { id: 'i-tv-01', inv: 'ИНВ-000412', serial: 'SN-43X7-0091', barcode: '4601546082130', maker: 'Samsung', makerPhone: '8 800 555-55-55', cost: 32990, warrantyStart: '2025-09-12', warrantyEnd: '2027-09-12', wh: 'w1', status: 'in', note: '' },
      { id: 'i-tv-02', inv: 'ИНВ-000413', serial: 'SN-43X7-0144', barcode: '4601546082147', maker: 'Samsung', makerPhone: '8 800 555-55-55', cost: 32990, warrantyStart: '2025-09-12', warrantyEnd: '2027-09-12', wh: 'w1', status: 'in', note: '' },
      { id: 'i-tv-03', inv: 'ИНВ-000414', serial: 'SN-43LG-2210', barcode: '8806091534521', maker: 'LG', makerPhone: '8 800 200-76-76', cost: 29900, warrantyStart: '2024-07-01', warrantyEnd: '2026-07-01', wh: 'w3', status: 'in', note: 'Царапина на рамке, не критично' },
      { id: 'i-tv-04', inv: 'ИНВ-000415', serial: 'SN-43LG-2255', barcode: '8806091534538', maker: 'LG', makerPhone: '8 800 200-76-76', cost: 29900, warrantyStart: '2024-03-18', warrantyEnd: '2026-06-18', wh: 'w2', status: 'warn', note: 'Гарантия истекает' },
    ],
  },
  {
    id: 'coffee',
    title: 'Кофемашина проф.',
    group: 'Бытовая техника',
    emoji: '☕',
    hue: 28,
    warrantyMonths: 12,
    items: [
      { id: 'i-cf-01', inv: 'ИНВ-000220', serial: 'JURA-WE8-1102', barcode: '7610917000000', maker: 'JURA', makerPhone: '+7 495 280-00-00', cost: 124900, warrantyStart: '2025-11-02', warrantyEnd: '2026-11-02', wh: 'w1', status: 'in', note: 'Комплект: 1 машина + 2 бункера' },
      { id: 'i-cf-02', inv: 'ИНВ-000221', serial: 'JURA-WE8-1140', barcode: '7610917000017', maker: 'JURA', makerPhone: '+7 495 280-00-00', cost: 124900, warrantyStart: '2025-05-20', warrantyEnd: '2026-05-20', wh: 'w4', status: 'broke', note: 'Не греет воду — на дефектовку' },
    ],
  },
  {
    id: 'router',
    title: 'Роутер Wi-Fi 6',
    group: 'Сетевое оборудование',
    emoji: '📶',
    hue: 268,
    warrantyMonths: 36,
    items: [
      { id: 'i-rt-01', inv: 'ИНВ-000501', serial: 'MT-AX-0001', barcode: '4620000000011', maker: 'MikroTik', makerPhone: '+371 6 7616 363', cost: 8990, warrantyStart: '2025-02-10', warrantyEnd: '2028-02-10', wh: 'w1', status: 'in', note: '' },
      { id: 'i-rt-02', inv: 'ИНВ-000502', serial: 'MT-AX-0002', barcode: '4620000000028', maker: 'MikroTik', makerPhone: '+371 6 7616 363', cost: 8990, warrantyStart: '2025-02-10', warrantyEnd: '2028-02-10', wh: 'w2', status: 'in', note: '' },
      { id: 'i-rt-03', inv: 'ИНВ-000503', serial: 'MT-AX-0003', barcode: '4620000000035', maker: 'MikroTik', makerPhone: '+371 6 7616 363', cost: 8990, warrantyStart: '2025-02-10', warrantyEnd: '2028-02-10', wh: 'w3', status: 'moved', note: 'Перемещён со склада «Центральный»' },
    ],
  },
  {
    id: 'ac',
    title: 'Кондиционер сплит',
    group: 'Климатическое',
    emoji: '❄️',
    hue: 198,
    warrantyMonths: 36,
    items: [
      { id: 'i-ac-01', inv: 'ИНВ-000310', serial: 'BLK-09-7781', barcode: '4810000000010', maker: 'Ballu', makerPhone: '8 800 550-00-99', cost: 41500, warrantyStart: '2024-06-01', warrantyEnd: '2027-06-01', wh: 'w2', status: 'in', note: '' },
      { id: 'i-ac-02', inv: 'ИНВ-000311', serial: 'BLK-09-7802', barcode: '4810000000027', maker: 'Ballu', makerPhone: '8 800 550-00-99', cost: 41500, warrantyStart: '2023-05-14', warrantyEnd: '2026-05-14', wh: 'w4', status: 'in', note: '' },
    ],
  },
  {
    id: 'proj',
    title: 'Проектор Full HD',
    group: 'Видеотехника',
    emoji: '📽️',
    hue: 320,
    warrantyMonths: 24,
    items: [
      { id: 'i-pj-01', inv: 'ИНВ-000601', serial: 'EPS-EB-3410', barcode: '4988617000001', maker: 'Epson', makerPhone: '8 800 100-00-00', cost: 56900, warrantyStart: '2025-08-22', warrantyEnd: '2027-08-22', wh: 'w3', status: 'in', note: '' },
    ],
  },
  {
    id: 'fridge',
    title: 'Холодильник',
    group: 'Бытовая техника',
    emoji: '🧊',
    hue: 188,
    warrantyMonths: 12,
    items: [
      { id: 'i-fr-01', inv: 'ИНВ-000150', serial: 'ATL-XM-4421', barcode: '4811000000019', maker: 'Atlant', makerPhone: '8 800 555-67-67', cost: 33900, warrantyStart: '2025-06-30', warrantyEnd: '2026-06-30', wh: 'w1', status: 'warn', note: 'Гарантия истекает' },
    ],
  },
  {
    id: 'mfu',
    title: 'МФУ лазерное',
    group: 'Оргтехника',
    emoji: '🖨️',
    hue: 240,
    warrantyMonths: 12,
    items: [
      { id: 'i-mf-01', inv: 'ИНВ-000702', serial: 'PNT-M28-5510', barcode: '4690000000016', maker: 'Pantum', makerPhone: '8 800 350-77-99', cost: 18700, warrantyStart: '2025-10-05', warrantyEnd: '2026-10-05', wh: 'w2', status: 'in', note: '' },
      { id: 'i-mf-02', inv: 'ИНВ-000703', serial: 'PNT-M28-5533', barcode: '4690000000023', maker: 'Pantum', makerPhone: '8 800 350-77-99', cost: 18700, warrantyStart: '2024-01-15', warrantyEnd: '2025-01-15', wh: 'w4', status: 'broke', note: 'Не захватывает бумагу, гарантия истекла' },
    ],
  },
  {
    id: 'ups',
    title: 'ИБП 1000 ВА',
    group: 'Сетевое оборудование',
    emoji: '🔋',
    hue: 138,
    warrantyMonths: 24,
    items: [
      { id: 'i-up-01', inv: 'ИНВ-000810', serial: 'IPN-BACK-9001', barcode: '4690000111016', maker: 'Ippon', makerPhone: '8 800 700-44-22', cost: 11200, warrantyStart: '2025-04-19', warrantyEnd: '2027-04-19', wh: 'w3', status: 'in', note: '' },
    ],
  },
]

export const seedWarehouses = [
  {
    id: 'w1',
    no: 'СК-01',
    title: 'Центральный склад',
    location: 'Ижевск, ул. Карла Маркса, 2',
    responsible: 'p1',
    appNo: 'АПП-2025/118',
    appDate: '2025-09-10',
    // несгораемый остаток: эталонное количество по родительской номенклатуре
    minStock: [
      { categoryId: 'tv43', qty: 2 },
      { categoryId: 'coffee', qty: 1 },
      { categoryId: 'router', qty: 1 },
      { categoryId: 'fridge', qty: 1 },
    ],
  },
  {
    id: 'w2',
    no: 'СК-02',
    title: 'Объект «Запад»',
    location: 'Ижевск, ул. Удмуртская, 304',
    responsible: 'p2',
    appNo: 'АПП-2025/124',
    appDate: '2025-10-01',
    minStock: [
      { categoryId: 'tv43', qty: 1 },
      { categoryId: 'router', qty: 1 },
      { categoryId: 'ac', qty: 1 },
      { categoryId: 'mfu', qty: 1 },
    ],
  },
  {
    id: 'w3',
    no: 'СК-03',
    title: 'Объект «Север»',
    location: 'Воткинск, ул. Победы, 17',
    responsible: 'p4',
    appNo: 'АПП-2026/006',
    appDate: '2026-01-20',
    minStock: [
      { categoryId: 'tv43', qty: 2 },
      { categoryId: 'router', qty: 1 },
      { categoryId: 'proj', qty: 1 },
      { categoryId: 'ups', qty: 1 },
    ],
  },
  {
    id: 'w4',
    no: 'СК-04',
    title: 'Сервисный буфер',
    location: 'Ижевск, ул. Ленина, 5 (склад брака)',
    responsible: 'p3',
    appNo: 'АПП-2025/090',
    appDate: '2025-07-04',
    minStock: [{ categoryId: 'ac', qty: 1 }],
  },
]

// Журнал перемещений ТМЦ между складами
export const seedMovements = [
  { id: 'm1', itemInv: 'ИНВ-000503', title: 'Роутер Wi-Fi 6', from: 'w1', to: 'w3', by: 'p1', date: '2026-06-10', kind: 'move' },
  { id: 'm2', itemInv: 'ИНВ-000221', title: 'Кофемашина проф.', from: 'w1', to: 'w4', by: 'p3', date: '2026-06-09', kind: 'defect' },
  { id: 'm3', itemInv: 'ИНВ-000415', title: 'ТВ-панель 43"', from: 'w3', to: 'w2', by: 'p2', date: '2026-06-07', kind: 'move' },
  { id: 'm4', itemInv: 'ИНВ-000703', title: 'МФУ лазерное', from: 'w2', to: 'w4', by: 'p3', date: '2026-06-05', kind: 'defect' },
  { id: 'm5', itemInv: 'ИНВ-000412', title: 'ТВ-панель 43"', from: '—', to: 'w1', by: 'p1', date: '2026-06-02', kind: 'in' },
]

// Акты списания / дефектовки
export const seedActs = [
  {
    id: 'a1', no: 'СПИС-2026/014', date: '2026-06-09', wh: 'w4',
    itemInv: 'ИНВ-000221', title: 'Кофемашина проф. JURA WE8', reason: 'Неисправен ТЭН, ремонт нецелесообразен',
    stage: 'defect', cost: 124900, taskTo: 'p2', taskText: 'Дозакупка кофемашины взамен списанной для СК-04',
  },
  {
    id: 'a2', no: 'СПИС-2026/013', date: '2026-06-05', wh: 'w4',
    itemInv: 'ИНВ-000703', title: 'МФУ лазерное Pantum M28', reason: 'Износ узла подачи, гарантия истекла',
    stage: 'writeoff', cost: 18700, taskTo: 'p2', taskText: 'Дозакупка МФУ взамен списанного для СК-02',
  },
]

// ── pure helpers (без стейта) ────────────────────────────────────────────────
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)

export const warrantyState = (item, today = TODAY) => {
  const left = daysBetween(today, item.warrantyEnd)
  if (left < 0) return { key: 'expired', left, label: 'Истекла' }
  if (left <= 30) return { key: 'soon', left, label: `${left} дн.` }
  return { key: 'ok', left, label: 'Действует' }
}

export const money = (n) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

export const shortDate = (s) => {
  if (!s || s === '—') return '—'
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y}`
}

// ISO-дата (YYYY-MM-DD) для «сегодня» демо — без Date.now в рендере
export const todayISO = () => TODAY

// Инициалы + стабильный оттенок для аватара по имени
export function avatarFor(name) {
  const parts = (name || '').split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '—'
  let h = 0
  for (const ch of name || 'x') h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return { initials, hue: h % 360 }
}

// Русская плюрализация: plural(2, ['акт','акта','актов']) → 'акта'
export const plural = (n, [one, few, many]) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}
