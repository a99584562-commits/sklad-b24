import { useState } from 'react'
import {
  warehouses,
  personById,
  itemsInWarehouse,
  stockCheck,
  categoryById,
  warrantyState,
  money,
  shortDate,
} from '../data.js'
import {
  Bezel,
  Reveal,
  Eyebrow,
  Badge,
  Avatar,
  Thumb,
  MetalButton,
  MossButton,
  IconButton,
  Meter,
  StatusBadge,
  Icon,
} from '../ui.jsx'

function StockStatus({ wh }) {
  const check = stockCheck(wh)
  const ok = check.filter((c) => c.ok).length
  const ratio = Math.round((ok / check.length) * 100)
  const tone = ratio === 100 ? 'ok' : ratio >= 60 ? 'warn' : 'bad'
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-ink-500">Несгораемый остаток</span>
        <span className="font-mono font-semibold text-ink-700">
          {ok}/{check.length}
        </span>
      </div>
      <Meter value={ratio} tone={tone} />
    </div>
  )
}

function WarehouseCard({ wh, onOpen, onClone }) {
  const items = itemsInWarehouse(wh.id)
  const resp = personById(wh.responsible)
  const value = items.reduce((s, i) => s + i.cost, 0)
  return (
    <Bezel interactive className="h-full">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl metal text-ink-700">
              <Icon name="boxes" size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-moss-600">{wh.no}</span>
              </div>
              <h3 className="text-[17px] font-bold leading-tight tracking-tight text-ink-900">{wh.title}</h3>
            </div>
          </div>
          <IconButton icon="clone" title="Клонировать склад" onClick={() => onClone(wh)} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-500">
          <Icon name="pin" size={14} className="text-ink-400" />
          <span className="truncate">{wh.location}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl well px-3.5 py-3">
            <div className="text-[11px] uppercase tracking-wider text-ink-400">Единиц</div>
            <div className="mt-0.5 font-mono text-xl font-semibold text-ink-900">{items.length}</div>
          </div>
          <div className="rounded-2xl well px-3.5 py-3">
            <div className="text-[11px] uppercase tracking-wider text-ink-400">Стоимость</div>
            <div className="mt-0.5 font-mono text-[15px] font-semibold text-ink-900">{money(value)}</div>
          </div>
        </div>

        <div className="mt-4">
          <StockStatus wh={wh} />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-ink-900/[0.03] px-3 py-2.5">
          <Icon name="contract" size={15} className="text-ink-400" />
          <span className="font-mono text-xs text-ink-700">{wh.appNo}</span>
          <span className="text-xs text-ink-400">от {shortDate(wh.appDate)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Avatar person={resp} size={30} />
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-ink-900">{resp?.name}</div>
              <div className="text-[11px] text-ink-400">{resp?.role.split('·')[0]}</div>
            </div>
          </div>
          <MetalButton size="sm" trailing="chevronR" onClick={() => onOpen(wh)}>
            Открыть
          </MetalButton>
        </div>
      </div>
    </Bezel>
  )
}

function WarehouseDrawer({ wh, onClose }) {
  if (!wh) return null
  const items = itemsInWarehouse(wh.id)
  const resp = personById(wh.responsible)
  const check = stockCheck(wh)

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-[fade-up_.3s_ease]" onClick={onClose} />
      <aside
        className="relative h-full w-full max-w-lg overflow-y-auto p-3"
        style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}
      >
        <div className="plate min-h-full rounded-4xl p-5 hairline">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>
                <span className="font-mono text-moss-600">{wh.no}</span> · складская ячейка
              </Eyebrow>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">{wh.title}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                <Icon name="pin" size={14} /> {wh.location}
              </div>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full metal text-ink-500 active:scale-95">
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* основание + ответственный */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl well p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                <Icon name="contract" size={13} /> Договор-основание
              </div>
              <div className="mt-1.5 font-mono text-sm font-semibold text-ink-900">{wh.appNo}</div>
              <div className="text-xs text-ink-500">АПП от {shortDate(wh.appDate)}</div>
            </div>
            <div className="rounded-2xl well p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                <Icon name="user" size={13} /> Ответственный
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Avatar person={resp} size={28} />
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold text-ink-900">{resp?.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* несгораемый остаток */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-bold text-ink-900">Несгораемый остаток · эталон / факт</h4>
              <Badge tone={check.every((c) => c.ok) ? 'ok' : 'bad'}>
                {check.filter((c) => c.ok).length}/{check.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {check.map((c) => (
                <div key={c.categoryId} className="flex items-center gap-3 rounded-2xl well px-3.5 py-2.5">
                  <Thumb emoji={c.category.emoji} hue={c.category.hue} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-ink-900">{c.category.title}</div>
                    <div className="text-xs text-ink-500">эталон {c.qty} ед.</div>
                  </div>
                  <span className={`font-mono text-sm font-bold ${c.ok ? 'text-moss-600' : 'text-rose-600'}`}>
                    {c.fact}/{c.qty}
                  </span>
                  {c.ok ? <Badge tone="ok" icon="check">ок</Badge> : <Badge tone="bad" icon="alert">−{c.gap}</Badge>}
                </div>
              ))}
            </div>
          </div>

          {/* содержимое */}
          <div className="mt-5">
            <h4 className="mb-2 text-sm font-bold text-ink-900">Содержимое · {items.length} ед.</h4>
            <div className="overflow-hidden rounded-2xl well divide-y divide-ink-900/[0.05]">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Thumb emoji={it.emoji} hue={it.hue} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-ink-900">{it.categoryTitle}</div>
                    <div className="font-mono text-[11px] text-ink-400">{it.inv}</div>
                  </div>
                  <StatusBadge status={it.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            <MetalButton icon="camera" className="flex-1 justify-center">
              Загрузить со скана
            </MetalButton>
            <MossButton icon="clone" trailing="arrowUR" className="flex-1 justify-center">
              Клонировать
            </MossButton>
          </div>
        </div>
      </aside>
    </div>
  )
}

function CloneToast({ wh, onClose }) {
  if (!wh) return null
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}>
      <div className="flex items-center gap-3 rounded-full plate py-2.5 pl-3 pr-2.5 hairline">
        <span className="grid h-9 w-9 place-items-center rounded-full glass-moss">
          <Icon name="clone" size={16} />
        </span>
        <div className="text-sm">
          <span className="font-semibold text-ink-900">Склад «{wh.title}» клонирован</span>
          <span className="ml-1.5 text-ink-500">→ новая ячейка-копия создана</span>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:text-ink-700">
          <Icon name="x" size={15} />
        </button>
      </div>
    </div>
  )
}

export default function Warehouses() {
  const [open, setOpen] = useState(null)
  const [cloned, setCloned] = useState(null)

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>
              <Icon name="boxes" size={12} /> Складские ячейки
            </Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[38px]">Склады и ячейки</h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500">
              Наполнение из справочника, договор-основание (АПП), ответственный и несгораемый остаток — основа для
              инвентаризации.
            </p>
          </div>
          <div className="flex gap-2.5">
            <MetalButton icon="camera">Загрузить со скана</MetalButton>
            <MossButton icon="plus" trailing="arrowUR">
              Создать ячейку
            </MossButton>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {warehouses.map((wh, i) => (
          <Reveal key={wh.id} delay={40 + i * 50}>
            <WarehouseCard wh={wh} onOpen={setOpen} onClone={setCloned} />
          </Reveal>
        ))}
      </div>

      <WarehouseDrawer wh={open} onClose={() => setOpen(null)} />
      <CloneToast wh={cloned} onClose={() => setCloned(null)} />
    </div>
  )
}
