import { useState } from 'react'
import { warrantyState, money, shortDate } from '../data.js'
import { useStore } from '../store.jsx'
import { toCSV, downloadFile } from '../csv.js'
import { Bezel, Reveal, Eyebrow, Badge, Thumb, MetalButton, Segmented, Meter, Toast, Icon } from '../ui.jsx'

function GrossReport() {
  const { categories, warehouses, items } = useStore()
  const live = items.filter((i) => i.status !== 'writtenoff')
  const rows = categories
    .map((c) => {
      const list = live.filter((i) => i.categoryId === c.id)
      const byWh = warehouses.map((w) => ({ wh: w, n: list.filter((i) => i.wh === w.id).length })).filter((x) => x.n > 0)
      return { c, count: list.length, value: list.reduce((s, i) => s + i.cost, 0), byWh }
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.value - a.value)
  const maxCount = Math.max(...rows.map((r) => r.count), 1)
  const totalValue = rows.reduce((s, r) => s + r.value, 0)

  return (
    <Bezel pad="p-0">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">Валовые остатки ТМЦ</h2>
          <p className="text-sm text-ink-500">По родительской номенклатуре · все склады</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl font-bold text-ink-900">{money(totalValue)}</div>
          <div className="text-xs text-ink-400">балансовая стоимость</div>
        </div>
      </div>
      <div className="divide-y divide-ink-900/[0.05] border-t border-ink-900/[0.06]">
        {rows.map((r) => (
          <div key={r.c.id} className="flex items-center gap-4 px-5 py-3.5">
            <Thumb emoji={r.c.emoji} hue={r.c.hue} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-ink-900">{r.c.title}</span>
                <Badge tone="mute">{r.c.group}</Badge>
              </div>
              <div className="mt-1.5 max-w-[260px]">
                <Meter value={(r.count / maxCount) * 100} tone="ok" />
              </div>
            </div>
            <div className="hidden items-center gap-1.5 md:flex">
              {r.byWh.map((x) => (
                <span key={x.wh.id} title={x.wh.title} className="inline-flex items-center gap-1 rounded-full bg-ink-900/[0.05] px-2 py-1 font-mono text-[11px] text-ink-600">
                  {x.wh.no}·{x.n}
                </span>
              ))}
            </div>
            <div className="w-12 text-right font-mono text-lg font-bold text-ink-900">{r.count}</div>
            <div className="hidden w-24 text-right font-mono text-[13px] font-semibold text-ink-700 sm:block">{money(r.value)}</div>
          </div>
        ))}
      </div>
    </Bezel>
  )
}

function WarehouseReport() {
  const { warehouses, warehouseById, itemsInWarehouse, stockCheck, categories } = useStore()
  const [whId, setWhId] = useState(warehouses[0].id)
  const wh = warehouseById(whId)
  const items = itemsInWarehouse(whId)
  const check = stockCheck(wh)
  const value = items.reduce((s, i) => s + i.cost, 0)
  const byCat = categories.map((c) => ({ c, items: items.filter((i) => i.categoryId === c.id) })).filter((x) => x.items.length > 0)

  return (
    <div className="space-y-4">
      <Segmented options={warehouses.map((w) => ({ value: w.id, label: w.no }))} value={whId} onChange={setWhId} />
      <Bezel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>
              <span className="font-mono text-moss-600">{wh.no}</span> · отчёт по складу
            </Eyebrow>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-ink-900">{wh.title}</h2>
            <p className="text-sm text-ink-500">{wh.location}</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl well px-4 py-2.5 text-center">
              <div className="font-mono text-xl font-bold text-ink-900">{items.length}</div>
              <div className="text-[11px] text-ink-400">единиц</div>
            </div>
            <div className="rounded-2xl well px-4 py-2.5 text-center">
              <div className="font-mono text-[15px] font-bold text-ink-900">{money(value)}</div>
              <div className="text-[11px] text-ink-400">стоимость</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2.5">
          {byCat.length === 0 && <div className="rounded-2xl well px-4 py-6 text-center text-sm text-ink-400">Склад пуст</div>}
          {byCat.map(({ c, items }) => {
            const ms = check.find((x) => x.categoryId === c.id)
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl well px-3.5 py-3">
                <Thumb emoji={c.emoji} hue={c.hue} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink-900">{c.title}</div>
                  <div className="text-xs text-ink-500">{items.map((i) => i.inv).join(' · ')}</div>
                </div>
                <span className="font-mono text-sm font-bold text-ink-900">{items.length} ед.</span>
                {ms &&
                  (ms.ok ? (
                    <Badge tone="ok" icon="check">
                      эталон {ms.qty}
                    </Badge>
                  ) : (
                    <Badge tone="bad" icon="alert">
                      −{ms.gap} к эталону
                    </Badge>
                  ))}
              </div>
            )
          })}
        </div>
      </Bezel>
    </div>
  )
}

function WarrantyReport() {
  const { items, warehouseById } = useStore()
  const live = items.filter((i) => i.status !== 'writtenoff')
  const buckets = {
    expired: live.filter((i) => warrantyState(i).key === 'expired'),
    soon: live.filter((i) => warrantyState(i).key === 'soon'),
    ok: live.filter((i) => warrantyState(i).key === 'ok'),
  }
  const cards = [
    { key: 'expired', title: 'Гарантия истекла', tone: 'bad', icon: 'alert', dateColor: 'text-rose-600' },
    { key: 'soon', title: 'Истекает ≤ 30 дней', tone: 'warn', icon: 'clock', dateColor: 'text-amber-600' },
    { key: 'ok', title: 'Гарантия действует', tone: 'ok', icon: 'shield', dateColor: 'text-ink-600' },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {cards.map((card) => {
        const list = buckets[card.key]
        return (
          <Bezel key={card.key} className="h-full" pad="p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2.5">
                <Badge tone={card.tone} icon={card.icon}>
                  {list.length}
                </Badge>
                <h3 className="text-sm font-bold text-ink-900">{card.title}</h3>
              </div>
            </div>
            <div className="divide-y divide-ink-900/[0.05] border-t border-ink-900/[0.06]">
              {list.length === 0 && <div className="px-4 py-6 text-center text-xs text-ink-400">— нет позиций —</div>}
              {list.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Thumb emoji={it.emoji} hue={it.hue} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-ink-900">{it.categoryTitle}</div>
                    <div className="font-mono text-[11px] text-ink-400">{it.inv}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-ink-400">{warehouseById(it.wh)?.no}</div>
                    <div className={`text-xs font-semibold ${card.dateColor}`}>{shortDate(it.warrantyEnd)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Bezel>
        )
      })}
    </div>
  )
}

export default function Reports() {
  const { items, categoryById, warehouseById } = useStore()
  const [tab, setTab] = useState('gross')
  const [toast, setToast] = useState(null)

  const exportExcel = () => {
    const headers = ['Инв. номер', 'Номенклатура', 'Группа', 'Зав. номер', 'Штрих-код', 'Производитель', 'Склад', 'Стоимость, ₽', 'Гарантия до', 'Статус']
    const STATUS = { in: 'В наличии', warn: 'Гарантия истекает', moved: 'Перемещён', broke: 'Дефект', writtenoff: 'Списан' }
    const rows = items.map((it) => {
      const c = categoryById(it.categoryId)
      const w = warehouseById(it.wh)
      return [it.inv, c?.title || '', c?.group || '', it.serial, it.barcode, it.maker, w?.no || '', it.cost, shortDate(it.warrantyEnd), STATUS[it.status] || it.status]
    })
    downloadFile('sklad-tmc.csv', toCSV(headers, rows))
    setToast({ title: 'Выгружено в CSV/Excel', sub: `${rows.length} строк · sklad-tmc.csv` })
    setTimeout(() => setToast(null), 3200)
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>
              <Icon name="chart" size={12} /> Аналитика и отчёты
            </Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[38px]">Отчёты</h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500">
              Валовые остатки, выборка по конкретному складу и гарантийная аналитика по срокам обслуживания.
            </p>
          </div>
          <MetalButton icon="download" trailing="arrowUR" onClick={exportExcel}>
            Выгрузить в Excel
          </MetalButton>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Segmented
          options={[
            { value: 'gross', label: 'Валовые остатки' },
            { value: 'wh', label: 'По складу' },
            { value: 'warranty', label: 'Гарантии' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </Reveal>

      <Reveal delay={100}>
        {tab === 'gross' && <GrossReport />}
        {tab === 'wh' && <WarehouseReport />}
        {tab === 'warranty' && <WarrantyReport />}
      </Reveal>

      <Toast open={!!toast} onClose={() => setToast(null)} title={toast?.title} sub={toast?.sub} icon="download" />
    </div>
  )
}
