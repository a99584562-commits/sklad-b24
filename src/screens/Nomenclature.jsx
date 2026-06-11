import { useState } from 'react'
import { categories, warehouseById, warrantyState, money, shortDate } from '../data.js'
import {
  Bezel,
  Reveal,
  Eyebrow,
  Badge,
  Thumb,
  MetalButton,
  MossButton,
  SearchField,
  Segmented,
  StatusBadge,
  Icon,
} from '../ui.jsx'

const WARR_TONE = { ok: 'ok', soon: 'warn', expired: 'bad' }

// Декоративный штрих-код из цифр EAN
function Barcode({ value }) {
  const widths = (value || '0000000000000').split('').map((d) => (parseInt(d, 10) % 4) + 1)
  return (
    <div className="flex h-12 items-end gap-[2px] overflow-hidden rounded-lg well px-3 py-2">
      {widths.map((w, i) => (
        <span key={i} className="h-full bg-ink-900" style={{ width: `${w}px`, opacity: 0.82 }} />
      ))}
    </div>
  )
}

function ItemRow({ it, onOpen }) {
  const w = warrantyState(it)
  return (
    <button
      onClick={() => onOpen(it)}
      className="group grid w-full grid-cols-12 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-900/[0.02]"
    >
      <div className="col-span-5 flex items-center gap-3 sm:col-span-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg metal text-ink-700">
          <Icon name="barcode" size={15} />
        </span>
        <div className="min-w-0">
          <div className="truncate font-mono text-[13px] font-semibold text-ink-900">{it.inv}</div>
          <div className="truncate font-mono text-[11px] text-ink-400">{it.serial}</div>
        </div>
      </div>
      <div className="col-span-3 hidden text-sm text-ink-700 sm:block">{it.maker}</div>
      <div className="col-span-3 hidden sm:block">
        <Badge tone={WARR_TONE[w.key]} icon="shield">
          {w.key === 'ok' ? shortDate(it.warrantyEnd) : w.label}
        </Badge>
      </div>
      <div className="col-span-4 text-right font-mono text-[13px] font-semibold text-ink-900 sm:col-span-1">
        {money(it.cost)}
      </div>
      <div className="col-span-3 flex justify-end sm:col-span-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/[0.05] text-ink-500 transition-transform duration-500 ease-spring group-hover:translate-x-0.5">
          <Icon name="chevronR" size={14} />
        </span>
      </div>
    </button>
  )
}

function CategoryCard({ c, q, onOpen, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const items = c.items.filter((i) => i.status !== 'writtenoff')
  const value = items.reduce((s, i) => s + i.cost, 0)
  const soon = items.filter((i) => ['soon', 'expired'].includes(warrantyState(i).key)).length

  return (
    <Bezel pad="p-0">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 p-4 text-left">
        <Thumb emoji={c.emoji} hue={c.hue} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[17px] font-bold tracking-tight text-ink-900">{c.title}</h3>
            <Badge tone="mute">{c.group}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="package" size={13} /> {items.length} ед.
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Icon name="ruble" size={13} /> {money(value)}
            </span>
            {soon > 0 && (
              <Badge tone="warn" icon="shield">
                гарантия ↓ {soon}
              </Badge>
            )}
          </div>
        </div>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full well text-ink-500 transition-transform duration-500 ease-spring ${
            open ? 'rotate-180' : ''
          }`}
        >
          <Icon name="chevronD" size={16} />
        </span>
      </button>

      <div
        className="grid transition-all duration-500 ease-spring"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="mx-3 mb-3 overflow-hidden rounded-2xl well">
            <div className="grid grid-cols-12 gap-3 border-b border-ink-900/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              <span className="col-span-5 sm:col-span-4">Инв. / зав. номер</span>
              <span className="col-span-3 hidden sm:block">Производитель</span>
              <span className="col-span-3 hidden sm:block">Гарантия</span>
              <span className="col-span-4 text-right sm:col-span-1">Стоимость</span>
              <span className="col-span-3 sm:col-span-1" />
            </div>
            <div className="divide-y divide-ink-900/[0.05] bg-white/40">
              {items.map((it) => (
                <ItemRow key={it.id} it={it} onOpen={onOpen} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Bezel>
  )
}

function ItemDrawer({ it, onClose }) {
  if (!it) return null
  const c = categories.find((x) => x.id === it.categoryId) || categories.find((x) => x.items.some((i) => i.id === it.id))
  const w = warrantyState(it)
  const wh = warehouseById(it.wh)
  const rows = [
    { k: 'Инвентарный номер', v: it.inv, mono: true },
    { k: 'Заводской номер', v: it.serial, mono: true },
    { k: 'Производитель', v: it.maker },
    { k: 'Телефон производителя', v: it.makerPhone, mono: true },
    { k: 'Закупочная стоимость', v: money(it.cost), mono: true },
    { k: 'Склад / ячейка', v: `${wh?.no} · ${wh?.title}` },
    { k: 'Гарантия с', v: shortDate(it.warrantyStart) },
    { k: 'Гарантия по', v: shortDate(it.warrantyEnd) },
  ]
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-[fade-up_.3s_ease]" onClick={onClose} />
      <aside
        className="relative h-full w-full max-w-md overflow-y-auto p-3"
        style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}
      >
        <div className="plate min-h-full rounded-4xl p-5 hairline">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Thumb emoji={c?.emoji} hue={c?.hue} size="lg" />
              <div>
                <Eyebrow>Карточка ТМЦ</Eyebrow>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-ink-900">{c?.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full metal text-ink-500 active:scale-95"
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <StatusBadge status={it.status} />
            <Badge tone={WARR_TONE[w.key]} icon="shield">
              {w.key === 'ok' ? `Гарантия до ${shortDate(it.warrantyEnd)}` : `Гарантия: ${w.label}`}
            </Badge>
          </div>

          {/* «Фото» */}
          <div className="mt-4 grid h-40 place-items-center rounded-3xl well">
            <span className="text-6xl drop-shadow">{c?.emoji}</span>
          </div>

          {/* Штрих-код */}
          <div className="mt-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Штрих-код</div>
            <Barcode value={it.barcode} />
            <div className="mt-1.5 text-center font-mono text-xs tracking-[0.3em] text-ink-500">{it.barcode}</div>
          </div>

          {/* Метрики */}
          <div className="mt-4 overflow-hidden rounded-2xl well">
            <dl className="divide-y divide-ink-900/[0.05]">
              {rows.map((r) => (
                <div key={r.k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-[13px] text-ink-500">{r.k}</dt>
                  <dd className={`text-right text-[13px] font-semibold text-ink-900 ${r.mono ? 'font-mono' : ''}`}>
                    {r.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {it.note && (
            <div className="mt-3 rounded-2xl bg-amber-400/10 p-3.5 ring-1 ring-inset ring-amber-500/20">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                <Icon name="alert" size={13} /> Примечание / дефекты
              </div>
              <p className="mt-1 text-sm text-ink-700">{it.note}</p>
            </div>
          )}

          <div className="mt-5 flex gap-2.5">
            <MetalButton icon="transfer" className="flex-1 justify-center">
              Переместить
            </MetalButton>
            <MossButton icon="writeoff" trailing="arrowUR" className="flex-1 justify-center">
              В акт
            </MossButton>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function Nomenclature() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('all')
  const [sel, setSel] = useState(null)

  const groups = ['all', ...new Set(categories.map((c) => c.group))]
  const segOptions = [{ value: 'all', label: 'Все' }, ...[...new Set(categories.map((c) => c.group))].map((g) => ({ value: g, label: g }))]

  const norm = (s) => s.toLowerCase()
  const filtered = categories.filter((c) => {
    if (group !== 'all' && c.group !== group) return false
    if (!q) return true
    const hay = [c.title, c.group, ...c.items.flatMap((i) => [i.inv, i.serial, i.maker, i.barcode])].join(' ')
    return norm(hay).includes(norm(q))
  })

  const totalUnits = categories.reduce((s, c) => s + c.items.filter((i) => i.status !== 'writtenoff').length, 0)

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>
              <Icon name="book" size={12} /> Справочник номенклатуры ТМЦ
            </Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[38px]">
              Единый справочник
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500">
              Родительские позиции и учёт отдельных единиц по заводским номерам с инвентарным номером, штрих-кодом,
              гарантией и закупочной стоимостью.
            </p>
          </div>
          <MetalButton icon="plus" trailing="arrowUR">
            Добавить позицию
          </MetalButton>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField value={q} onChange={setQ} placeholder="Инв. номер, заводской, производитель, штрих-код…" className="sm:max-w-md sm:flex-1" />
          <div className="overflow-x-auto pb-1">
            <Segmented options={segOptions} value={group} onChange={setGroup} />
          </div>
        </div>
      </Reveal>

      <Reveal delay={90}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
          <Badge tone="mute" icon="layers">
            {filtered.length} групп
          </Badge>
          <Badge tone="mute" icon="package">
            {totalUnits} единиц всего
          </Badge>
        </div>
      </Reveal>

      <div className="space-y-3">
        {filtered.map((c, i) => (
          <Reveal key={c.id} delay={40 + i * 35}>
            <CategoryCard c={c} q={q} onOpen={setSel} defaultOpen={i === 0} />
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <Bezel>
            <div className="grid place-items-center py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl well text-ink-400">
                <Icon name="search" size={20} />
              </span>
              <p className="mt-3 text-sm text-ink-500">Ничего не найдено по запросу «{q}»</p>
            </div>
          </Bezel>
        )}
      </div>

      <ItemDrawer it={sel} onClose={() => setSel(null)} />
    </div>
  )
}
