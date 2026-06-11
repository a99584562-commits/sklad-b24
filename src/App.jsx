import { useState } from 'react'
import { people } from './data.js'
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

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl glass-moss">
        <Icon name="boxes" size={20} className="text-white" />
      </span>
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight text-ink-900">СКЛАД</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">забаланс · Б24</div>
      </div>
    </div>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold ${ease} ${
        active ? 'metal text-ink-900' : 'text-ink-500 hover:bg-ink-900/[0.04] hover:text-ink-700'
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

export default function App() {
  const [view, setView] = useState('dashboard')
  const me = people[1] // Марина Котова — менеджер проекта
  const go = (v) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
              <span className="h-1.5 w-1.5 rounded-full bg-moss-500 animate-pulse" /> синхронизация Б24
            </div>
            <div className="mt-2 text-[13px] font-semibold text-ink-900">Портал подключён</div>
            <div className="text-[11px] text-ink-400">crm.bitrix24.ru · REST</div>
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
            <button className="grid h-9 w-9 place-items-center rounded-full text-ink-500">
              <Icon name="bell" size={17} />
            </button>
            <Avatar person={me} size={34} />
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-6xl px-4 pb-32 pt-4 sm:px-6 lg:px-10 lg:pt-8">
          {/* desktop utility row */}
          <div className="mb-6 hidden items-center justify-end gap-2 lg:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500 hairline">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> демо-макет
            </span>
            <button className="grid h-9 w-9 place-items-center rounded-full metal text-ink-500">
              <Icon name="bell" size={16} />
            </button>
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
