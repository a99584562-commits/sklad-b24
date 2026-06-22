import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import {
  seedCategories,
  seedWarehouses,
  seedMovements,
  seedActs,
  people,
  personById,
  TODAY,
} from './data.js'

const STORAGE_KEY = 'sklad-b24-state-v2'

// Боевой режим (деплой на VibeCode, сборка с base=/): хранение на сервере, старт БЕЗ демо-данных.
// Демо-режим (GH Pages base=/sklad-b24/ и dev): сиды + localStorage.
export const USE_API = import.meta.env.BASE_URL === '/'

const EMPTY = { categories: [], items: [], warehouses: [], movements: [], acts: [] }

// Разворачиваем сид (вложенные items) в плоский стейт
function buildSeed() {
  const categories = seedCategories.map(({ items, ...c }) => c)
  const items = seedCategories.flatMap((c) => c.items.map((it) => ({ ...it, categoryId: c.id })))
  return {
    categories,
    items,
    warehouses: seedWarehouses.map((w) => ({ ...w, minStock: w.minStock.map((m) => ({ ...m })) })),
    movements: [...seedMovements],
    acts: [...seedActs],
  }
}

function buildInitial() {
  return USE_API ? { ...EMPTY } : buildSeed()
}

function loadInitial() {
  if (USE_API) return { ...EMPTY } // реальное состояние придёт с сервера (гидратация)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && Array.isArray(p.items) && Array.isArray(p.categories) && Array.isArray(p.warehouses)) return p
    }
  } catch {
    /* ignore */
  }
  return buildInitial()
}

let _seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}${(_seq++).toString(36)}`

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        categories: action.state.categories || [],
        items: action.state.items || [],
        warehouses: action.state.warehouses || [],
        movements: action.state.movements || [],
        acts: action.state.acts || [],
      }
    case 'RESET':
      return buildInitial()
    case 'ADD_ITEM': {
      const cats = action.category ? [...state.categories, action.category] : state.categories
      return { ...state, categories: cats, items: [...state.items, action.item] }
    }
    case 'MOVE_ITEM': {
      const items = state.items.map((it) =>
        it.id === action.itemId ? { ...it, wh: action.toWh, status: it.status === 'broke' ? 'broke' : 'moved' } : it,
      )
      return { ...state, items, movements: [action.movement, ...state.movements] }
    }
    case 'ADD_WAREHOUSE':
    case 'CLONE_WAREHOUSE':
      return { ...state, warehouses: [...state.warehouses, action.warehouse] }
    case 'IMPORT_SCAN':
      return {
        ...state,
        items: [...state.items, ...action.items],
        movements: [...action.movements, ...state.movements],
      }
    case 'WRITE_OFF': {
      const items = state.items.map((it) => (it.id === action.itemId ? { ...it, status: 'writtenoff' } : it))
      return { ...state, items, acts: [action.act, ...state.acts] }
    }
    default:
      return state
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)
  const ready = useRef(!USE_API) // в demo готов сразу; в API ждём гидратацию

  // Гидратация с сервера (боевой режим)
  useEffect(() => {
    if (!USE_API) return
    let alive = true
    fetch('/api/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (alive && s) dispatch({ type: 'HYDRATE', state: s })
      })
      .catch(() => {})
      .finally(() => {
        ready.current = true
      })
    return () => {
      alive = false
    }
  }, [])

  // Сохранение состояния
  useEffect(() => {
    if (USE_API) {
      if (!ready.current) return // не перезаписываем сервер пустым до гидратации
      const t = setTimeout(() => {
        fetch('/api/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        }).catch(() => {})
      }, 400)
      return () => clearTimeout(t)
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota / private mode — пропускаем */
    }
  }, [state])

  const value = useMemo(() => {
    const categoryById = (id) => state.categories.find((c) => c.id === id)
    const warehouseById = (id) => state.warehouses.find((w) => w.id === id)

    const enrich = (it) => {
      const c = categoryById(it.categoryId)
      return { ...it, categoryTitle: c?.title || '—', emoji: c?.emoji || '📦', hue: c?.hue ?? 210 }
    }
    const items = state.items.map(enrich)

    const itemsInWarehouse = (whId) => items.filter((it) => it.wh === whId && it.status !== 'writtenoff')

    const stockCheck = (wh) =>
      wh.minStock.map((ms) => {
        const fact = itemsInWarehouse(wh.id).filter(
          (it) => it.categoryId === ms.categoryId && it.status !== 'broke',
        ).length
        return { ...ms, fact, ok: fact >= ms.qty, gap: Math.max(0, ms.qty - fact), category: categoryById(ms.categoryId) }
      })

    const maxInv = () => {
      const nums = state.items.map((it) => parseInt(String(it.inv).replace(/\D/g, ''), 10)).filter((n) => !isNaN(n))
      return nums.length ? Math.max(...nums) : 900
    }
    const fmtInv = (n) => 'ИНВ-' + String(n).padStart(6, '0')
    const randomBarcode = (n) => String(4600000000000 + (n * 7919) % 99999999)

    // ── actions ──────────────────────────────────────────────────────────────
    const addItem = ({ categoryId, newCategory, serial, maker, makerPhone, cost, warrantyStart, warrantyEnd, wh, note }) => {
      let category = null
      let catId = categoryId
      if (newCategory && newCategory.title) {
        catId = uid('cat')
        category = {
          id: catId,
          title: newCategory.title,
          group: newCategory.group || 'Прочее',
          emoji: newCategory.emoji || '📦',
          hue: newCategory.hue ?? 210,
          warrantyMonths: 24,
        }
      }
      const n = maxInv() + 1
      const item = {
        id: uid('item'),
        categoryId: catId,
        inv: fmtInv(n),
        serial: serial || 'SN-' + n,
        barcode: randomBarcode(n),
        maker: maker || '—',
        makerPhone: makerPhone || '',
        cost: Number(cost) || 0,
        warrantyStart: warrantyStart || TODAY,
        warrantyEnd: warrantyEnd || TODAY,
        wh: wh || state.warehouses[0]?.id || '',
        status: 'in',
        note: note || '',
      }
      dispatch({ type: 'ADD_ITEM', item, category })
      return item
    }

    const moveItem = (itemId, toWh, by = 'p2') => {
      const it = state.items.find((x) => x.id === itemId)
      if (!it || it.wh === toWh) return
      const c = categoryById(it.categoryId)
      const movement = {
        id: uid('mv'),
        itemInv: it.inv,
        title: c?.title || '—',
        from: it.wh,
        to: toWh,
        by,
        date: TODAY,
        kind: 'move',
      }
      dispatch({ type: 'MOVE_ITEM', itemId, toWh, movement })
    }

    const nextWhNo = () => 'СК-' + String(state.warehouses.length + 1).padStart(2, '0')

    const addWarehouse = ({ title, location, responsible, appNo, minStock = [] }) => {
      const warehouse = {
        id: uid('wh'),
        no: nextWhNo(),
        title: title || 'Новый склад',
        location: location || '—',
        responsible: responsible || people[0].id,
        appNo: appNo || 'АПП-2026/—',
        appDate: TODAY,
        minStock,
      }
      dispatch({ type: 'ADD_WAREHOUSE', warehouse })
      return warehouse
    }

    const cloneWarehouse = (whId) => {
      const src = warehouseById(whId)
      if (!src) return null
      const warehouse = {
        ...src,
        id: uid('wh'),
        no: nextWhNo(),
        title: src.title + ' (копия)',
        appNo: 'АПП-2026/—',
        appDate: TODAY,
        minStock: src.minStock.map((m) => ({ ...m })),
      }
      dispatch({ type: 'CLONE_WAREHOUSE', warehouse })
      return warehouse
    }

    const importScan = (whId, n = 3) => {
      const cats = state.categories
      let next = maxInv()
      const newItems = []
      const movements = []
      for (let i = 0; i < n; i++) {
        next += 1
        const c = cats[i % cats.length]
        const inv = fmtInv(next)
        newItems.push({
          id: uid('item'),
          categoryId: c.id,
          inv,
          serial: 'SCAN-' + next,
          barcode: randomBarcode(next),
          maker: '—',
          makerPhone: '',
          cost: 0,
          warrantyStart: TODAY,
          warrantyEnd: TODAY,
          wh: whId,
          status: 'in',
          note: 'Загружено со скана',
        })
        movements.push({ id: uid('mv'), itemInv: inv, title: c.title, from: '—', to: whId, by: 'p1', date: TODAY, kind: 'in' })
      }
      dispatch({ type: 'IMPORT_SCAN', items: newItems, movements })
      return newItems
    }

    const nextActNo = () => {
      const nums = state.acts.map((a) => parseInt(String(a.no).split('/')[1], 10)).filter((n) => !isNaN(n))
      const n = (nums.length ? Math.max(...nums) : 12) + 1
      return 'СПИС-2026/' + String(n).padStart(3, '0')
    }

    const writeOff = (itemId, reason) => {
      const it = state.items.find((x) => x.id === itemId)
      if (!it) return null
      const c = categoryById(it.categoryId)
      const wh = warehouseById(it.wh)
      const act = {
        id: uid('act'),
        no: nextActNo(),
        date: TODAY,
        wh: it.wh,
        itemInv: it.inv,
        title: `${c?.title || '—'} ${it.maker && it.maker !== '—' ? it.maker : ''}`.trim(),
        reason: reason || it.note || 'Списание по результатам дефектовки',
        stage: 'writeoff',
        cost: it.cost || 0,
        taskTo: wh?.responsible || 'p2',
        taskText: `Дозакупка «${c?.title || 'ТМЦ'}» взамен списанной для ${wh?.no || ''}`.trim(),
      }
      dispatch({ type: 'WRITE_OFF', itemId, act })
      // боевой режим: ставим реальную автозадачу в Б24 (best-effort)
      if (USE_API) {
        fetch('/api/b24/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: act.taskText, description: `Акт ${act.no} · ${act.title} · ${act.reason}` }),
        }).catch(() => {})
      }
      return act
    }

    const resetDemo = () => dispatch({ type: 'RESET' })

    return {
      state,
      categories: state.categories,
      warehouses: state.warehouses,
      people,
      items,
      movements: state.movements,
      acts: state.acts,
      categoryById,
      warehouseById,
      personById,
      itemsInWarehouse,
      stockCheck,
      addItem,
      moveItem,
      addWarehouse,
      cloneWarehouse,
      importScan,
      writeOff,
      resetDemo,
    }
  }, [state])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
