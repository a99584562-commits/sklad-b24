import { useEffect, useMemo, useRef, useState } from 'react'
import { people, warrantyState } from './data.js'
import { useStore, USE_API } from './store.jsx'
import { Avatar, Icon } from './ui.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Nomenclature from './screens/Nomenclature.jsx'
import Warehouses from './screens/Warehouses.jsx'
import Inventory from './screens/Inventory.jsx'
import Reports from './screens/Reports.jsx'
import WriteOffs from './screens/WriteOffs.jsx'

const NAV = [
  { id: 'dashboard', label: 'Обзор', icon: 'grid' },
  { id: 'nomenclature', label: 'Справочник', icon: 'book' },
  { id: 'warehouses', label: 'Склады', icon: 'boxes' },
  { id: 'inventory', label: 'Инвентаризация', icon: 'scan' },
  { id: 'reports', label: 'Отчёты', icon: 'chart' },
  { id: 'writeoffs', label: 'Списание', icon: 'writeoff' },
]

const ease = 'transition-all duration-500 ease-spring'
const IS_PROD = USE_API // боевой режим (VibeCode) vs демо (GH Pages)

// Профиль для аватара из имени вошедшего пользователя Б24
function personFromUser(name, role) {
  const parts = (name || '').split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'Б24'
  let h = 0
  for (const ch of name || 'x') h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return { name: name || 'Пользователь', role: role === 'ADMIN' ? 'Администратор' : 'Сотрудник портала', initials, hue: h % 360 }
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl glass-moss">
        <Icon name="boxes" size={20} className="text-ink-900" />
      </span>
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight text-ink-900">СКЛАД</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">25/7 · Б24</div>
      </div>
    </div>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold ${ease} ${
        active ? 'pressed text-ink-900' : 'text-ink-500 hover:bg-ink-900/[0.04] hover:text-ink-700'
      }`}
    >
      <span className={`${active ? 'text-moss-600' : 'text-ink-400 group-hover:text-ink-600'} ${ease}`}>
        <Icon name={item.icon} size={18} />
      </span>
      {item.label}
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-moss-500" />}
    </button>
  )
}

const TONE_TEXT = { bad: 'text-rose-600', warn: 'text-amber-600', info: 'text-sky-600', ok: 'text-moss-600' }

// Реальные уведомления склада из текущего состояния
function useNotifications() {
  const { items, warehouses, stockCheck, acts } = useStore()
  return useMemo(() => {
    const live = items.filter((i) => i.status !== 'writtenoff')
    const out = []

    warehouses.forEach((w) => {
      const bad = stockCheck(w).filter((s) => !s.ok)
      if (bad.length)
        out.push({
          id: 'stock-' + w.id,
          tone: 'bad',
          icon: 'alert',
          title: `${w.no}: дефицит несгораемого остатка`,
          sub: bad.map((b) => `${b.category?.title} −${b.gap}`).join(', '),
          to: 'warehouses',
        })
    })

    const broke = live.filter((i) => i.status === 'broke')
    if (broke.length)
      out.push({
        id: 'broke',
        tone: 'bad',
        icon: 'writeoff',
        title: `В дефектовке: ${broke.length} ед.`,
        sub: 'ожидают акта списания',
        to: 'writeoffs',
      })

    const expired = live.filter((i) => warrantyState(i).key === 'expired')
    if (expired.length)
      out.push({
        id: 'warr-exp',
        tone: 'bad',
        icon: 'shield',
        title: `Гарантия истекла: ${expired.length}`,
        sub: 'требуется решение по ТМЦ',
        to: 'reports',
      })

    const soon = live.filter((i) => warrantyState(i).key === 'soon')
    if (soon.length)
      out.push({
        id: 'warr-soon',
        tone: 'warn',
        icon: 'clock',
        title: `Гарантия истекает: ${soon.length}`,
        sub: 'в ближайшие 30 дней',
        to: 'reports',
      })

    acts.slice(0, 2).forEach((a) =>
      out.push({
        id: 'task-' + a.id,
        tone: 'info',
        icon: 'spark',
        title: a.taskText,
        sub: `авто-задача по акту ${a.no}`,
        to: 'writeoffs',
      }),
    )

    return out
  }, [items, warehouses, acts, stockCheck])
}

function Notifications({ go, size = 16 }) {
  const list = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const actionable = list.filter((n) => n.tone === 'bad' || n.tone === 'warn').length

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Уведомления"
        className={`relative grid h-9 w-9 place-items-center rounded-full text-ink-500 ${ease} metal active:scale-95 ${open ? 'pressed' : ''}`}
      >
        <Icon name="bell" size={size} />
        {actionable > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {actionable}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 max-w-[calc(100vw-2rem)]"
          style={{ animation: 'fade-up .35s cubic-bezier(0.32,0.72,0,1) both' }}
        >
          <div className="plate rounded-3xl p-2 hairline shadow-ambient-lg">
            <div className="flex items-center justify-between px-3 pb-2 pt-2">
              <span className="text-sm font-bold tracking-tight text-ink-900">Уведомления</span>
              {actionable > 0 ? (
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                  {actionable} требуют внимания
                </span>
              ) : (
                <span className="rounded-full bg-moss-50 px-2 py-0.5 text-[11px] font-bold text-moss-600">всё в норме</span>
              )}
            </div>

            <div className="max-h-[60vh] space-y-1 overflow-y-auto">
              {list.length === 0 && (
                <div className="grid place-items-center gap-2 px-4 py-8 text-center">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl well text-moss-600">
                    <Icon name="check" size={18} />
                  </span>
                  <p className="text-sm text-ink-500">Уведомлений нет — всё под контролем</p>
                </div>
              )}
              {list.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    go(n.to)
                    setOpen(false)
                  }}
                  className="group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors hover:bg-ink-900/[0.03]"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl well ${TONE_TEXT[n.tone]}`}>
                    <Icon name={n.icon} size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink-900">{n.title}</span>
                    <span className="block truncate text-[11px] text-ink-500">{n.sub}</span>
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900/[0.04] text-ink-400 transition-transform duration-500 ease-spring group-hover:translate-x-0.5">
                    <Icon name="chevronR" size={14} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const { resetDemo } = useStore()
  const [view, setView] = useState('dashboard')
  const [b24, setB24] = useState(null)
  const [user, setUser] = useState(null)

  // реальный вошедший пользователь Б24 (боевой режим), иначе демо-профиль
  const me = useMemo(() => {
    if (!USE_API) return people[1]
    if (user?.authenticated) return personFromUser(user.name, user.role)
    return { name: user ? 'Гость' : 'Загрузка…', role: 'Битрикс24', initials: '—', hue: 210 }
  }, [user])

  useEffect(() => {
    if (!USE_API) return
    fetch('/api/b24/me')
      .then((r) => r.json())
      .then(setB24)
      .catch(() => setB24({ connected: false }))
    fetch('/api/me')
      .then((r) => r.json())
      .then(setUser)
      .catch(() => setUser({ authenticated: false }))
  }, [])

  const go = (v) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const onReset = () => {
    if (window.confirm('Сбросить демо-данные к исходному состоянию? Добавленные позиции, перемещения и акты будут удалены.')) {
      resetDemo()
      go('dashboard')
    }
  }

  const Screen = { dashboard: Dashboard, nomenclature: Nomenclature, warehouses: Warehouses, inventory: Inventory, reports: Reports, writeoffs: WriteOffs }[view]

  return (
    <div className="min-h-[100dvh]">
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] p-4 lg:block">
        <div className="plate flex h-full flex-col rounded-4xl p-4 hairline">
          <div className="px-1.5 pb-1 pt-1">
            <Brand />
          </div>

          <nav className="mt-6 space-y-1">
            {NAV.map((n) => (
              <NavItem key={n.id} item={n} active={view === n.id} onClick={() => go(n.id)} />
            ))}
          </nav>

          {/* mini status */}
          <div className="mt-6 rounded-2xl well p-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              <span className={`h-1.5 w-1.5 rounded-full ${b24 && !b24.connected ? 'bg-rose-500' : 'bg-moss-500 animate-pulse'}`} /> синхронизация Б24
            </div>
            <div className="mt-2 text-[13px] font-semibold text-ink-900">{b24 && !b24.connected ? 'Нет связи с порталом' : 'Портал подключён'}</div>
            <div className="text-[11px] text-ink-400">{b24?.portal || '25-7.pro'} · REST</div>
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-2xl bg-ink-900/[0.03] p-2.5">
            <Avatar person={me} size={36} />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-bold text-ink-900">{me.name}</div>
              <div className="truncate text-[11px] text-ink-400">{me.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        <div className="plate flex w-full items-center justify-between rounded-full py-2 pl-3 pr-2 hairline backdrop-blur-xl">
          <Brand />
          <div className="flex items-center gap-1.5">
            <Notifications go={go} size={17} />
            <Avatar person={me} size={34} />
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-6xl px-4 pb-32 pt-4 sm:px-6 lg:px-10 lg:pt-8">
          {/* desktop utility row */}
          <div className="mb-6 hidden items-center justify-end gap-2 lg:flex">
            {!IS_PROD && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500 hairline">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> демо-макет
                </span>
                <button
                  onClick={onReset}
                  title="Сбросить демо-данные"
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-ink-700 metal active:scale-95"
                >
                  <Icon name="clock" size={15} className="text-ink-500" />
                  Сбросить демо
                </button>
              </>
            )}
            <Notifications go={go} size={16} />
          </div>

          <Screen go={go} key={view} />
        </div>
      </main>

      {/* ── Mobile floating island nav ──────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 lg:hidden">
        <div className="plate flex items-center gap-0.5 rounded-full p-1.5 hairline backdrop-blur-xl">
          {NAV.map((n) => {
            const active = view === n.id
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`grid h-12 w-12 place-items-center rounded-full ${ease} ${
                  active ? 'metal text-moss-600' : 'text-ink-400 active:scale-90'
                }`}
                title={n.label}
              >
                <Icon name={n.icon} size={20} />
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
