import { useMemo, useState } from 'react'
import { money, shortDate } from '../data.js'
import { useStore } from '../store.jsx'
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
  Modal,
  Field,
  Select,
  Toast,
  Icon,
} from '../ui.jsx'

function StockStatus({ wh }) {
  const { stockCheck } = useStore()
  const check = stockCheck(wh)
  const ok = check.filter((c) => c.ok).length
  const ratio = check.length ? Math.round((ok / check.length) * 100) : 100
  const tone = ratio === 100 ? 'ok' : ratio >= 60 ? 'warn' : 'bad'
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-ink-500">Несгораемый остаток</span>
        <span className="font-mono font-semibold text-ink-700">
          {ok}/{check.length || 0}
        </span>
      </div>
      <Meter value={ratio} tone={tone} />
    </div>
  )
}

function WarehouseCard({ wh, onOpen, onClone }) {
  const { itemsInWarehouse, personById } = useStore()
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
              <span className="font-mono text-xs font-bold text-moss-600">{wh.no}</span>
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
          <MetalButton size="sm" trailing="chevronR" onClick={() => onOpen(wh.id)}>
            Открыть
          </MetalButton>
        </div>
      </div>
    </Bezel>
  )
}

function WarehouseDrawer({ whId, onClose, onClone, onImport, flash }) {
  const { warehouseById, itemsInWarehouse, stockCheck, personById } = useStore()
  const wh = warehouseById(whId)
  if (!wh) return null
  const items = itemsInWarehouse(wh.id)
  const resp = personById(wh.responsible)
  const check = stockCheck(wh)

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-[fade-up_.3s_ease]" onClick={onClose} />
      <aside className="relative h-full w-full max-w-lg overflow-y-auto p-3" style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}>
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
                <div className="text-[13px] font-semibold text-ink-900">{resp?.name}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-bold text-ink-900">Несгораемый остаток · эталон / факт</h4>
              <Badge tone={check.every((c) => c.ok) ? 'ok' : 'bad'}>
                {check.filter((c) => c.ok).length}/{check.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {check.length === 0 && <div className="rounded-2xl well px-3.5 py-4 text-center text-xs text-ink-400">Эталон не задан</div>}
              {check.map((c) => (
                <div key={c.categoryId} className="flex items-center gap-3 rounded-2xl well px-3.5 py-2.5">
                  <Thumb emoji={c.category?.emoji} hue={c.category?.hue} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-ink-900">{c.category?.title}</div>
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

          <div className="mt-5">
            <h4 className="mb-2 text-sm font-bold text-ink-900">Содержимое · {items.length} ед.</h4>
            <div className="divide-y divide-ink-900/[0.05] overflow-hidden rounded-2xl well">
              {items.length === 0 && <div className="px-3.5 py-5 text-center text-xs text-ink-400">Склад пуст — загрузите номенклатуру</div>}
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
            <MetalButton
              icon="camera"
              className="flex-1 justify-center"
              onClick={() => {
                const added = onImport(wh.id)
                flash({ title: `Загружено ${added.length} позиции со скана`, sub: `в ${wh.no}` })
              }}
            >
              Загрузить со скана
            </MetalButton>
            <MossButton icon="clone" trailing="arrowUR" className="flex-1 justify-center" onClick={() => onClone(wh)}>
              Клонировать
            </MossButton>
          </div>
        </div>
      </aside>
    </div>
  )
}

function CreateModal({ open, onClose, onSave }) {
  const { people } = useStore()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [responsible, setResponsible] = useState(people[0]?.id || '')
  const [appNo, setAppNo] = useState('')
  return (
    <Modal open={open} onClose={onClose} eyebrow="Складская ячейка" icon="boxes" title="Создать ячейку">
      <div className="mt-4 grid grid-cols-1 gap-3">
        <Field label="Название" value={title} onChange={setTitle} placeholder="Напр. Объект «Восток»" />
        <Field label="Адрес / расположение" value={location} onChange={setLocation} placeholder="Город, улица" />
        <Select label="Ответственный" value={responsible} onChange={setResponsible} options={people.map((p) => ({ value: p.id, label: `${p.name} · ${p.role.split('·')[0].trim()}` }))} />
        <Field label="Договор-основание (АПП)" value={appNo} onChange={setAppNo} placeholder="АПП-2026/…" />
      </div>
      <div className="mt-5 flex gap-2.5">
        <MetalButton className="flex-1 justify-center" onClick={onClose}>
          Отмена
        </MetalButton>
        <MossButton
          icon="check"
          trailing="arrowUR"
          className="flex-1 justify-center"
          onClick={() => title.trim() && onSave({ title: title.trim(), location, responsible, appNo })}
        >
          Создать
        </MossButton>
      </div>
    </Modal>
  )
}

function ImportModal({ open, onClose, onImport }) {
  const { warehouses } = useStore()
  const [wh, setWh] = useState(warehouses[0]?.id || '')
  const [count, setCount] = useState('3')
  return (
    <Modal open={open} onClose={onClose} eyebrow="Загрузка со скана" icon="camera" title="Импорт номенклатуры" maxW="max-w-md">
      <p className="mt-3 text-sm text-ink-500">
        Имитация загрузки позиций со скана накладной/АПП с присвоением инвентарных номеров. После загрузки комплекты
        можно отредактировать.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3">
        <Select label="Склад назначения" value={wh} onChange={setWh} options={warehouses.map((w) => ({ value: w.id, label: `${w.no} · ${w.title}` }))} />
        <Field label="Сколько позиций распознано" value={count} onChange={setCount} type="number" />
      </div>
      <div className="mt-5 flex gap-2.5">
        <MetalButton className="flex-1 justify-center" onClick={onClose}>
          Отмена
        </MetalButton>
        <MossButton icon="download" trailing="arrowUR" className="flex-1 justify-center" onClick={() => onImport(wh, Math.max(1, Math.min(12, Number(count) || 3)))}>
          Загрузить
        </MossButton>
      </div>
    </Modal>
  )
}

export default function Warehouses() {
  const { warehouses, addWarehouse, cloneWarehouse, importScan } = useStore()
  const [openId, setOpenId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [toast, setToast] = useState(null)

  const flash = (t) => {
    setToast(t)
    setTimeout(() => setToast(null), 3600)
  }
  const openWh = useMemo(() => warehouses.find((w) => w.id === openId) || null, [warehouses, openId])

  const doClone = (wh) => {
    const w = cloneWarehouse(wh.id)
    flash({ title: `Склад «${wh.title}» клонирован`, sub: `создана ячейка ${w?.no}` })
  }

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
            <MetalButton icon="camera" onClick={() => setImporting(true)}>
              Загрузить со скана
            </MetalButton>
            <MossButton icon="plus" trailing="arrowUR" onClick={() => setCreating(true)}>
              Создать ячейку
            </MossButton>
          </div>
        </div>
      </Reveal>

      {warehouses.length === 0 ? (
        <Bezel>
          <div className="grid place-items-center gap-3 py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl well text-ink-400">
              <Icon name="boxes" size={22} />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-ink-900">Складов пока нет</p>
              <p className="mt-1 text-sm text-ink-500">Создайте первую ячейку: наполнение, договор-основание (АПП) и ответственный</p>
            </div>
            <MossButton icon="plus" trailing="arrowUR" onClick={() => setCreating(true)}>
              Создать ячейку
            </MossButton>
          </div>
        </Bezel>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((wh, i) => (
            <Reveal key={wh.id} delay={40 + i * 50}>
              <WarehouseCard wh={wh} onOpen={setOpenId} onClone={doClone} />
            </Reveal>
          ))}
        </div>
      )}

      {openId && (
        <WarehouseDrawer
          whId={openId}
          onClose={() => setOpenId(null)}
          onClone={doClone}
          onImport={(id) => importScan(id, 3)}
          flash={flash}
        />
      )}

      <CreateModal
        open={creating}
        onClose={() => setCreating(false)}
        onSave={(data) => {
          const w = addWarehouse(data)
          setCreating(false)
          flash({ title: `Ячейка ${w.no} создана`, sub: w.title })
        }}
      />

      <ImportModal
        open={importing}
        onClose={() => setImporting(false)}
        onImport={(wh, n) => {
          const added = importScan(wh, n)
          setImporting(false)
          flash({ title: `Загружено ${added.length} позиций со скана`, sub: 'инв. номера присвоены' })
        }}
      />

      <Toast open={!!toast} onClose={() => setToast(null)} title={toast?.title} sub={toast?.sub} icon="clone" />
    </div>
  )
}
