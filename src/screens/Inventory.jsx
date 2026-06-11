import { useEffect, useMemo, useState } from 'react'
import { warehouses, itemsInWarehouse, personById, shortDate, TODAY } from '../data.js'
import {
  Bezel,
  Reveal,
  Eyebrow,
  Badge,
  Avatar,
  Thumb,
  MetalButton,
  MossButton,
  Segmented,
  Icon,
} from '../ui.jsx'

const ROW_TONE = {
  pending: { tone: 'mute', label: 'Ожидает', icon: 'clock' },
  found: { tone: 'ok', label: 'Подтверждён', icon: 'check' },
  missing: { tone: 'bad', label: 'Отсутствует', icon: 'x' },
}

// Кольцевой индикатор прогресса
function Ring({ value, size = 132 }) {
  const r = (size - 16) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - value / 100)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(20,23,28,.08)" strokeWidth="10" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#mossgrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(0.32,0.72,0,1)' }}
      />
      <defs>
        <linearGradient id="mossgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34c785" />
          <stop offset="1" stopColor="#16855a" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Scanner({ scanning, last, onScan, disabled }) {
  return (
    <div className="relative overflow-hidden rounded-3xl well p-1.5">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.35rem] bg-gradient-to-b from-ink-900 to-[#0c1a14]">
        {/* viewfinder corners */}
        <div className="absolute inset-6">
          {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map(
            (cls) => (
              <span key={cls} className={`absolute h-8 w-8 rounded-[6px] border-moss-400/80 ${cls}`} />
            ),
          )}
        </div>

        {/* scanline */}
        {scanning && (
          <div className="absolute inset-x-10 top-1/2 h-px bg-moss-400 shadow-[0_0_18px_4px_rgba(70,201,126,.7)] animate-scanline" />
        )}

        {/* content */}
        {last ? (
          <div className="flex flex-col items-center gap-2 text-center" style={{ animation: 'fade-up .4s ease both' }}>
            <span className="text-5xl drop-shadow">{last.emoji}</span>
            <div className="font-mono text-sm font-semibold text-white">{last.inv}</div>
            <Badge tone="ok" icon="check">
              QR подтверждён
            </Badge>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/55">
            <Icon name="qr" size={42} strokeWidth={1.25} />
            <span className="text-xs">{scanning ? 'Считывание…' : 'Наведите камеру на QR / штрих-код'}</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${scanning ? 'bg-moss-400 animate-pulse' : 'bg-white/40'}`} />
          <span className="text-[10px] uppercase tracking-wider text-white/70">камера склада</span>
        </div>
      </div>

      <div className="px-1.5 pb-1 pt-3">
        <MossButton icon="scan" trailing="arrowUR" onClick={onScan} className="w-full justify-center" size="lg">
          {disabled ? 'Инвентаризация завершена' : 'Сканировать единицу'}
        </MossButton>
      </div>
    </div>
  )
}

export default function Inventory({ go }) {
  const [whId, setWhId] = useState(warehouses[0].id)
  const wh = warehouses.find((w) => w.id === whId)
  const expected = useMemo(() => itemsInWarehouse(whId), [whId])

  const [statuses, setStatuses] = useState({})
  const [scanning, setScanning] = useState(false)
  const [last, setLast] = useState(null)

  useEffect(() => {
    setStatuses(Object.fromEntries(expected.map((i) => [i.id, 'pending'])))
    setLast(null)
    setScanning(false)
  }, [whId, expected])

  const set = (id, st) => setStatuses((s) => ({ ...s, [id]: st }))

  const counts = expected.reduce(
    (a, i) => {
      a[statuses[i.id] || 'pending']++
      return a
    },
    { pending: 0, found: 0, missing: 0 },
  )
  const resolved = counts.found + counts.missing
  const progress = expected.length ? Math.round((resolved / expected.length) * 100) : 0
  const done = counts.pending === 0 && expected.length > 0

  const scanNext = () => {
    if (scanning) return
    const next = expected.find((i) => (statuses[i.id] || 'pending') === 'pending')
    if (!next) return
    setScanning(true)
    setLast(null)
    setTimeout(() => {
      setLast(next)
      set(next.id, 'found')
      setScanning(false)
    }, 900)
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>
              <span className="h-1.5 w-1.5 rounded-full bg-moss-500 animate-pulse" /> Инвентаризация по QR
            </Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[38px]">
              Сверка с эталоном
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500">
              Сканируйте QR/штрих-код единиц и подтверждайте наличие. Система формирует фактическое наполнение и
              расхождение от эталонного остатка склада.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={50}>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <span className="shrink-0 text-sm font-medium text-ink-500">Склад:</span>
          <Segmented
            options={warehouses.map((w) => ({ value: w.id, label: `${w.no}` }))}
            value={whId}
            onChange={setWhId}
          />
          <span className="hidden shrink-0 text-sm text-ink-400 sm:inline">{wh.title}</span>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* scanner */}
        <Reveal delay={80} className="lg:col-span-5">
          <Bezel className="h-full">
            <Scanner scanning={scanning} last={last} onScan={scanNext} disabled={done} />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { k: 'found', n: counts.found, l: 'Подтверждено', c: 'text-moss-600' },
                { k: 'missing', n: counts.missing, l: 'Отсутствует', c: 'text-rose-600' },
                { k: 'pending', n: counts.pending, l: 'Осталось', c: 'text-ink-500' },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl well py-3">
                  <div className={`font-mono text-2xl font-semibold ${s.c}`}>{s.n}</div>
                  <div className="text-[11px] text-ink-400">{s.l}</div>
                </div>
              ))}
            </div>
          </Bezel>
        </Reveal>

        {/* progress + list */}
        <Reveal delay={120} className="lg:col-span-7">
          <Bezel className="h-full" pad="p-0">
            <div className="flex items-center gap-5 p-5">
              <div className="relative grid shrink-0 place-items-center">
                <Ring value={progress} />
                <div className="absolute text-center">
                  <div className="font-mono text-2xl font-bold text-ink-900">{progress}%</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-400">сверено</div>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold tracking-tight text-ink-900">{wh.title}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-ink-500">
                  <Avatar person={personById(wh.responsible)} size={24} />
                  {personById(wh.responsible)?.name}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="mute" icon="contract">
                    {wh.appNo}
                  </Badge>
                  <Badge tone="mute" icon="clock">
                    {shortDate(TODAY)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto border-t border-ink-900/[0.06]">
              {expected.map((it) => {
                const st = statuses[it.id] || 'pending'
                const meta = ROW_TONE[st]
                return (
                  <div
                    key={it.id}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                      st === 'found' ? 'bg-moss-50/60' : st === 'missing' ? 'bg-rose-500/[0.04]' : ''
                    }`}
                  >
                    <Thumb emoji={it.emoji} hue={it.hue} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-ink-900">{it.categoryTitle}</div>
                      <div className="font-mono text-[11px] text-ink-400">
                        {it.inv} · {it.barcode}
                      </div>
                    </div>
                    {st === 'pending' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => set(it.id, 'found')}
                          title="Подтвердить наличие"
                          className="grid h-8 w-8 place-items-center rounded-full metal text-moss-600 active:scale-95"
                        >
                          <Icon name="check" size={15} />
                        </button>
                        <button
                          onClick={() => set(it.id, 'missing')}
                          title="Отметить отсутствие"
                          className="grid h-8 w-8 place-items-center rounded-full metal text-rose-500 active:scale-95"
                        >
                          <Icon name="x" size={15} />
                        </button>
                      </div>
                    ) : (
                      <Badge tone={meta.tone} icon={meta.icon}>
                        {meta.label}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </Bezel>
        </Reveal>
      </div>

      {/* итог */}
      {done && (
        <Reveal>
          <Bezel>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    counts.missing ? 'bg-rose-500/10 text-rose-600' : 'glass-moss'
                  }`}
                >
                  <Icon name={counts.missing ? 'alert' : 'check'} size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-ink-900">
                    {counts.missing ? `Выявлено расхождение: ${counts.missing}` : 'Расхождений нет — склад сверен'}
                  </h3>
                  <p className="text-sm text-ink-500">
                    Подтверждено {counts.found} из {expected.length} единиц фактического наполнения {wh.no}.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <MetalButton icon="download">Зафиксировать</MetalButton>
                {counts.missing > 0 && (
                  <MossButton icon="writeoff" trailing="arrowUR" onClick={() => go('writeoffs')}>
                    Сформировать акт
                  </MossButton>
                )}
              </div>
            </div>
          </Bezel>
        </Reveal>
      )}
    </div>
  )
}
