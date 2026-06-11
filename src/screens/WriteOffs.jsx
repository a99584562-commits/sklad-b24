import { useState } from 'react'
import { acts, allItems, warehouseById, personById, money, shortDate } from '../data.js'
import {
  Bezel,
  Reveal,
  Eyebrow,
  Badge,
  Avatar,
  Thumb,
  MetalButton,
  MossButton,
  Icon,
} from '../ui.jsx'

// Цепочка стадий акта
function Chain({ stage }) {
  const steps = [
    { key: 'defect', label: 'Дефектовка', icon: 'alert' },
    { key: 'writeoff', label: 'Списание', icon: 'writeoff' },
    { key: 'task', label: 'Задача на дозакупку', icon: 'spark' },
  ]
  const reached = stage === 'writeoff' ? 3 : 2
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => {
        const active = i < reached
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                active ? 'glass-moss' : 'well text-ink-400'
              }`}
            >
              <Icon name={s.icon} size={12} />
              {s.label}
            </span>
            {i < steps.length - 1 && <Icon name="chevronR" size={12} className="text-ink-300" />}
          </div>
        )
      })}
    </div>
  )
}

function ActCard({ a }) {
  const wh = warehouseById(a.wh)
  const taskTo = personById(a.taskTo)
  return (
    <Bezel interactive>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl well text-rose-500">
            <Icon name="writeoff" size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-ink-900">{a.no}</span>
              <Badge tone="mute">{shortDate(a.date)}</Badge>
            </div>
            <h3 className="mt-0.5 text-[15px] font-semibold text-ink-900">{a.title}</h3>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink-400">
              <Icon name="barcode" size={12} /> {a.itemInv} · {wh?.no}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-bold text-rose-600">−{money(a.cost)}</div>
          <div className="text-xs text-ink-400">к списанию</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-ink-900/[0.03] px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          <Icon name="alert" size={12} /> Причина
        </div>
        <p className="mt-1 text-sm text-ink-700">{a.reason}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Chain stage={a.stage} />
      </div>

      {/* авто-задача */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-moss-50 px-3.5 py-3 ring-1 ring-inset ring-moss-500/20">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl glass-moss">
          <Icon name="spark" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-moss-700">Авто-задача в Б24</div>
          <div className="truncate text-[13px] font-semibold text-ink-900">{a.taskText}</div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar person={taskTo} size={28} />
          <span className="hidden text-xs text-ink-500 sm:inline">{taskTo?.name.split(' ')[0]}</span>
        </div>
      </div>
    </Bezel>
  )
}

function CreateModal({ open, onClose, onCreate }) {
  const defective = allItems.filter((i) => i.status === 'broke')
  const [picked, setPicked] = useState(null)
  const [reason, setReason] = useState('')
  if (!open) return null

  const item = defective.find((i) => i.id === picked)
  const wh = item ? warehouseById(item.wh) : null
  const taskTo = wh ? personById(wh.responsible) : null

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink-900/35 backdrop-blur-sm animate-[fade-up_.3s_ease]" onClick={onClose} />
      <div
        className="relative w-full max-w-lg"
        style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}
      >
        <div className="plate rounded-4xl p-5 hairline">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>
                <Icon name="writeoff" size={12} /> Новый акт списания
              </Eyebrow>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-ink-900">ТМЦ, пришедшее в негодность</h3>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full metal text-ink-500 active:scale-95">
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            1 · Выберите единицу
          </div>
          <div className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
            {defective.map((it) => (
              <button
                key={it.id}
                onClick={() => setPicked(it.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-all ${
                  picked === it.id ? 'glass-moss' : 'well'
                }`}
              >
                <Thumb emoji={it.emoji} hue={it.hue} size="sm" className={picked === it.id ? 'ring-2 ring-white/40' : ''} />
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-[13px] font-semibold ${picked === it.id ? 'text-white' : 'text-ink-900'}`}>
                    {it.categoryTitle}
                  </div>
                  <div className={`font-mono text-[11px] ${picked === it.id ? 'text-white/80' : 'text-ink-400'}`}>
                    {it.inv} · {warehouseById(it.wh)?.no}
                  </div>
                </div>
                {picked === it.id && <Icon name="check" size={16} className="text-white" />}
              </button>
            ))}
            {defective.length === 0 && (
              <div className="rounded-2xl well px-4 py-6 text-center text-xs text-ink-400">
                Нет ТМЦ со статусом «дефект»
              </div>
            )}
          </div>

          <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ink-400">2 · Причина</div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={item?.note || 'Опишите дефект / причину списания…'}
            className="mt-2 w-full resize-none rounded-2xl well px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />

          {/* предпросмотр авто-задачи */}
          {item && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-moss-50 px-3.5 py-3 ring-1 ring-inset ring-moss-500/20">
              <Icon name="spark" size={16} className="shrink-0 text-moss-600" />
              <div className="min-w-0 flex-1 text-[13px] text-ink-700">
                Будет создана задача в Б24 на <span className="font-semibold">{taskTo?.name}</span>: дозакупка «
                {item.categoryTitle}» для {wh?.no}.
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-2.5">
            <MetalButton className="flex-1 justify-center" onClick={onClose}>
              Отмена
            </MetalButton>
            <MossButton
              icon="check"
              trailing="arrowUR"
              className="flex-1 justify-center"
              onClick={() => item && onCreate(item)}
            >
              Сформировать акт
            </MossButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toast({ data, onClose }) {
  if (!data) return null
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}>
      <div className="flex items-center gap-3 rounded-full plate py-2.5 pl-3 pr-2.5 hairline">
        <span className="grid h-9 w-9 place-items-center rounded-full glass-moss">
          <Icon name="check" size={16} />
        </span>
        <div className="text-sm">
          <span className="font-semibold text-ink-900">Акт {data.no} сформирован</span>
          <span className="ml-1.5 text-ink-500">+ задача на дозакупку поставлена</span>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:text-ink-700">
          <Icon name="x" size={15} />
        </button>
      </div>
    </div>
  )
}

export default function WriteOffs() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const defectiveCount = allItems.filter((i) => i.status === 'broke').length

  const handleCreate = (item) => {
    setOpen(false)
    setToast({ no: `СПИС-2026/0${15 + Math.min(item.cost % 5, 4)}` })
    setTimeout(() => setToast(null), 4200)
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>
              <Icon name="writeoff" size={12} /> Акты дефектовки и списания
            </Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[38px]">Списание ТМЦ</h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500">
              Акт дефектовки и акт списания на негодное оборудование с автоматической постановкой задачи ответственному на
              наполнение склада.
            </p>
          </div>
          <MossButton icon="plus" trailing="arrowUR" onClick={() => setOpen(true)}>
            Новый акт
          </MossButton>
        </div>
      </Reveal>

      <Reveal delay={50}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="bad" icon="alert">
            {defectiveCount} ед. в дефектовке
          </Badge>
          <Badge tone="mute" icon="writeoff">
            {acts.length} акта за период
          </Badge>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {acts.map((a, i) => (
          <Reveal key={a.id} delay={40 + i * 60}>
            <ActCard a={a} />
          </Reveal>
        ))}
      </div>

      <CreateModal open={open} onClose={() => setOpen(false)} onCreate={handleCreate} />
      <Toast data={toast} onClose={() => setToast(null)} />
    </div>
  )
}
