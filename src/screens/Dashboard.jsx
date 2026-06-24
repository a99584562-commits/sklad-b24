import { warrantyState, money, shortDate, plural } from '../data.js'
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
  Sparkbars,
  Icon,
} from '../ui.jsx'

const MOVE_META = {
  move: { tone: 'info', label: 'Перемещение', icon: 'transfer', color: 'text-sky-600' },
  defect: { tone: 'bad', label: 'В сервис', icon: 'alert', color: 'text-rose-600' },
  in: { tone: 'ok', label: 'Поступление', icon: 'download', color: 'text-moss-600' },
}

function StatTile({ icon, label, value, sub, tone = 'mute', delay = 0 }) {
  const ring = {
    mute: 'text-ink-700',
    ok: 'text-moss-600',
    warn: 'text-amber-600',
    bad: 'text-rose-600',
  }[tone]
  return (
    <Reveal delay={delay}>
      <Bezel interactive className="h-full">
        <div className="flex items-start justify-between">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl well ${ring}`}>
            <Icon name={icon} size={20} />
          </span>
          {sub && <Badge tone={tone}>{sub}</Badge>}
        </div>
        <div className="mt-5">
          <div className="font-mono text-[28px] font-semibold leading-none tracking-tight text-ink-900">{value}</div>
          <div className="mt-2 text-sm text-ink-500">{label}</div>
        </div>
      </Bezel>
    </Reveal>
  )
}

export default function Dashboard({ go }) {
  const { items, categories, warehouses, movements, itemsByCat, warehouseById, personById, stockCheck } = useStore()
  const live = items.filter((i) => i.status !== 'writtenoff')
  const totalValue = live.reduce((s, i) => s + i.cost, 0)
  const warrantySoon = live.filter((i) => ['soon', 'expired'].includes(warrantyState(i).key)).length
  const violations = warehouses.filter((w) => stockCheck(w).some((s) => !s.ok)).length

  // валовые остатки по родительской номенклатуре (через индекс — без перебора всех единиц)
  const bars = categories
    .map((c) => ({ label: c.title.split(' ')[0], value: (itemsByCat[c.id] || []).filter((i) => i.status !== 'writtenoff').length }))
    .filter((b) => b.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>
              <span className="h-1.5 w-1.5 rounded-full bg-moss-500" /> Забалансовый учёт · обзор
            </Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[40px] sm:leading-[1.05]">
              Оборудование под контролем
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500">
              Единая картина по ТМЦ, переданным по актам приёма-передачи: остатки, гарантии, перемещения и расхождения с
              эталоном.
            </p>
          </div>
          <div className="flex gap-2.5">
            <MetalButton icon="clone" onClick={() => go('warehouses')}>
              Клонировать склад
            </MetalButton>
            <MossButton icon="scan" trailing="arrowUR" onClick={() => go('inventory')}>
              Инвентаризация
            </MossButton>
          </div>
        </div>
      </Reveal>

      {/* KPI bento */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon="package" label="Единиц на забалансе" value={live.length} sub={`${categories.length} ${plural(categories.length, ['группа', 'группы', 'групп'])}`} delay={40} />
        <StatTile icon="ruble" label="Балансовая стоимость" value={money(totalValue).replace('₽', '₽')} tone="ok" delay={90} />
        <StatTile icon="shield" label="Гарантия истекает" value={warrantySoon} sub="≤ 30 дн." tone="warn" delay={140} />
        <StatTile icon="alert" label="Нарушен несгораемый остаток" value={violations} sub={`${violations} ${plural(violations, ['склад', 'склада', 'складов'])}`} tone="bad" delay={190} />
      </div>

      {/* Main bento row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Валовые остатки */}
        <Reveal delay={80} className="lg:col-span-7">
          <Bezel className="h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-ink-900">Валовые остатки</h2>
                <p className="text-sm text-ink-500">Единиц по родительской номенклатуре · все склады</p>
              </div>
              <MetalButton size="sm" icon="chart" onClick={() => go('reports')}>
                Отчёты
              </MetalButton>
            </div>
            {bars.length ? (
              <Sparkbars data={bars} className="mt-6" />
            ) : (
              <div className="mt-6 grid place-items-center gap-2 rounded-2xl well py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-2xl metal text-ink-400">
                  <Icon name="package" size={18} />
                </span>
                <p className="text-sm text-ink-500">Пока нет ТМЦ — добавьте позиции в справочник</p>
              </div>
            )}
          </Bezel>
        </Reveal>

        {/* Quick actions */}
        <Reveal delay={130} className="lg:col-span-5">
          <Bezel className="h-full">
            <h2 className="text-lg font-bold tracking-tight text-ink-900">Быстрые действия</h2>
            <p className="text-sm text-ink-500">Частые операции склада</p>
            <div className="mt-5 grid gap-3">
              {[
                { icon: 'book', t: 'Добавить позицию в справочник', s: 'Новая номенклатура ТМЦ', to: 'nomenclature' },
                { icon: 'boxes', t: 'Создать складскую ячейку', s: 'Наполнение + АПП + ответственный', to: 'warehouses' },
                { icon: 'writeoff', t: 'Акт списания / дефектовки', s: 'С авто-задачей на дозакупку', to: 'writeoffs' },
              ].map((a) => (
                <button
                  key={a.t}
                  onClick={() => go(a.to)}
                  className="group flex items-center gap-4 rounded-2xl well p-3.5 text-left transition-all duration-500 ease-spring hover:-translate-y-0.5"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl metal text-ink-700">
                    <Icon name={a.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-900">{a.t}</span>
                    <span className="block truncate text-xs text-ink-500">{a.s}</span>
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/[0.05] text-ink-500 transition-transform duration-500 ease-spring group-hover:translate-x-0.5">
                    <Icon name="chevronR" size={15} />
                  </span>
                </button>
              ))}
            </div>
          </Bezel>
        </Reveal>
      </div>

      {/* Movements feed */}
      <Reveal delay={60}>
        <Bezel pad="p-0">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink-900">Журнал перемещений ТМЦ</h2>
              <p className="text-sm text-ink-500">Передвижения между складами и в сервис</p>
            </div>
            <Badge tone="info" icon="transfer">
              {movements.length} за неделю
            </Badge>
          </div>
          {movements.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-2 px-5 pb-8 pt-6 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-2xl well text-ink-400">
                <Icon name="transfer" size={18} />
              </span>
              <p className="text-sm text-ink-500">Перемещений пока нет — они появятся при движении ТМЦ между складами</p>
            </div>
          ) : (
          <div className="mt-4 divide-y divide-ink-900/[0.05]">
            {movements.map((m) => {
              const meta = MOVE_META[m.kind]
              const by = personById(m.by)
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl well ${meta.color}`}>
                    <Icon name={meta.icon} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink-900">{m.title}</span>
                      <span className="font-mono text-xs text-ink-400">{m.itemInv}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                      <span>{m.from === '—' ? 'Поступление' : warehouseById(m.from)?.no}</span>
                      <Icon name="chevronR" size={11} className="text-ink-400" />
                      <span className="font-medium text-ink-700">{warehouseById(m.to)?.no}</span>
                    </div>
                  </div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <div className="hidden items-center gap-2 sm:flex">
                    <Avatar person={by} size={28} />
                    <span className="text-xs text-ink-500">{shortDate(m.date)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </Bezel>
      </Reveal>
    </div>
  )
}
