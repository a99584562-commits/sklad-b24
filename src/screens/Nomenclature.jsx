import { useMemo, useState } from 'react'
import { warrantyState, money, shortDate, plural } from '../data.js'
import { useStore } from '../store.jsx'
import { QR, Barcode, qrPayload } from '../codes.jsx'
import { PrintLabelModal } from '../LabelPrint.jsx'
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
  Modal,
  Field,
  Select,
  TextArea,
  Toast,
  Avatar,
  Icon,
} from '../ui.jsx'

const WARR_TONE = { ok: 'ok', soon: 'warn', expired: 'bad' }
const EMOJI = ['📦', '📺', '☕', '📶', '❄️', '📽️', '🧊', '🖨️', '🔋', '🔌', '🖥️', '🎧']

function ItemRow({ it, onOpen }) {
  const w = warrantyState(it)
  return (
    <button
      onClick={() => onOpen(it)}
      className="group grid w-full grid-cols-12 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-900/[0.02]"
    >
      <div className="col-span-5 flex items-center gap-3 sm:col-span-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg metal text-ink-700">
          <Icon name="qr" size={15} />
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

function CategoryCard({ c, items, onOpen, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
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

      <div className="grid transition-all duration-500 ease-spring" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
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
              {items.length === 0 && (
                <div className="px-4 py-5 text-center text-xs text-ink-400">Нет единиц в этой группе</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Bezel>
  )
}

function ItemDrawer({ it, onClose, onMove, onWriteOff, onPrint }) {
  const { categoryById, warehouseById } = useStore()
  if (!it) return null
  const c = categoryById(it.categoryId)
  const w = warrantyState(it)
  const wh = warehouseById(it.wh)
  const rows = [
    { k: 'Инвентарный номер', v: it.inv, mono: true },
    { k: 'Заводской номер', v: it.serial, mono: true },
    { k: 'Производитель', v: it.maker },
    { k: 'Телефон производителя', v: it.makerPhone || '—', mono: true },
    { k: 'Закупочная стоимость', v: money(it.cost), mono: true },
    { k: 'Склад / ячейка', v: `${wh?.no || '—'} · ${wh?.title || ''}` },
    { k: 'Гарантия с', v: shortDate(it.warrantyStart) },
    { k: 'Гарантия по', v: shortDate(it.warrantyEnd) },
  ]
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-[fade-up_.3s_ease]" onClick={onClose} />
      <aside className="relative h-full w-full max-w-md overflow-y-auto p-3" style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}>
        <div className="plate min-h-full rounded-4xl p-5 hairline">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Thumb emoji={c?.emoji} hue={c?.hue} size="lg" />
              <div>
                <Eyebrow>Карточка ТМЦ</Eyebrow>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-ink-900">{c?.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full metal text-ink-500 active:scale-95">
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={it.status} />
            <Badge tone={WARR_TONE[w.key]} icon="shield">
              {w.key === 'ok' ? `Гарантия до ${shortDate(it.warrantyEnd)}` : `Гарантия: ${w.label}`}
            </Badge>
          </div>

          {/* QR + штрих-код */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">QR-код единицы</div>
              <QR value={qrPayload(it.inv)} size={120} />
              <div className="mt-1 text-center font-mono text-[11px] text-ink-400">{it.inv}</div>
            </div>
            <div className="flex flex-col">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Штрих-код</div>
              <Barcode value={it.barcode} className="flex-1" />
              <div className="mt-1 text-center font-mono text-[11px] tracking-[0.15em] text-ink-400">{it.barcode}</div>
            </div>
          </div>

          <MetalButton icon="printer" className="mt-3 w-full justify-center" onClick={() => onPrint(it)}>
            Печать этикетки
          </MetalButton>

          <div className="mt-4 overflow-hidden rounded-2xl well">
            <dl className="divide-y divide-ink-900/[0.05]">
              {rows.map((r) => (
                <div key={r.k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-[13px] text-ink-500">{r.k}</dt>
                  <dd className={`text-right text-[13px] font-semibold text-ink-900 ${r.mono ? 'font-mono' : ''}`}>{r.v}</dd>
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
            <MetalButton icon="transfer" className="flex-1 justify-center" onClick={() => onMove(it)}>
              Переместить
            </MetalButton>
            <MossButton icon="writeoff" trailing="arrowUR" className="flex-1 justify-center" onClick={() => onWriteOff(it)}>
              В акт
            </MossButton>
          </div>
        </div>
      </aside>
    </div>
  )
}

function AddModal({ open, onClose, onSave }) {
  const { categories, warehouses } = useStore()
  const [mode, setMode] = useState(categories.length ? 'existing' : 'new')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [title, setTitle] = useState('')
  const [group, setGroup] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [maker, setMaker] = useState('')
  const [serial, setSerial] = useState('')
  const [cost, setCost] = useState('')
  const [wh, setWh] = useState(warehouses[0]?.id || '')
  const [wStart, setWStart] = useState('2026-06-11')
  const [wEnd, setWEnd] = useState('2028-06-11')

  const valid = mode === 'existing' ? !!categoryId : title.trim().length > 1

  const save = () => {
    if (!valid) return
    onSave({
      categoryId: mode === 'existing' ? categoryId : undefined,
      newCategory: mode === 'new' ? { title: title.trim(), group: group.trim() || 'Прочее', emoji } : undefined,
      maker,
      serial,
      cost,
      warrantyStart: wStart,
      warrantyEnd: wEnd,
      wh,
    })
  }

  return (
    <Modal open={open} onClose={onClose} eyebrow="Справочник номенклатуры" icon="plus" title="Добавить позицию ТМЦ">
      <div className="mt-4">
        <Segmented
          options={[
            { value: 'existing', label: 'В существующую группу' },
            { value: 'new', label: 'Новая группа' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {mode === 'existing' ? (
          <Select
            label="Группа номенклатуры"
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.title}` }))}
            className="col-span-2"
          />
        ) : (
          <>
            <Field label="Название группы" value={title} onChange={setTitle} placeholder="Напр. Ноутбук 15”" />
            <Field label="Категория" value={group} onChange={setGroup} placeholder="Оргтехника" />
            <div className="col-span-2">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">Иконка</span>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${emoji === e ? 'glass-moss' : 'well'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <Field label="Производитель" value={maker} onChange={setMaker} placeholder="Samsung" />
        <Field label="Заводской номер" value={serial} onChange={setSerial} placeholder="SN-…" />
        <Field label="Закупочная стоимость, ₽" value={cost} onChange={setCost} placeholder="0" type="number" />
        <Select
          label="Склад / ячейка"
          value={wh}
          onChange={setWh}
          options={[
            { value: '', label: warehouses.length ? '— не размещён —' : '— нет складов —' },
            ...warehouses.map((w) => ({ value: w.id, label: `${w.no} · ${w.title}` })),
          ]}
        />
        <Field label="Гарантия с" value={wStart} onChange={setWStart} type="date" />
        <Field label="Гарантия по" value={wEnd} onChange={setWEnd} type="date" />
      </div>

      <div className="mt-3 rounded-2xl bg-ink-900/[0.03] px-3.5 py-2.5 text-[12px] text-ink-500">
        Инвентарный номер, штрих-код и QR будут присвоены автоматически.
      </div>

      <div className="mt-5 flex gap-2.5">
        <MetalButton className="flex-1 justify-center" onClick={onClose}>
          Отмена
        </MetalButton>
        <MossButton icon="check" trailing="arrowUR" className="flex-1 justify-center" onClick={save}>
          Добавить
        </MossButton>
      </div>
    </Modal>
  )
}

function MoveModal({ item, onClose, onConfirm }) {
  const { warehouses, warehouseById } = useStore()
  const [to, setTo] = useState('')
  if (!item) return null
  const from = warehouseById(item.wh)
  const targets = warehouses.filter((w) => w.id !== item.wh)
  return (
    <Modal open={!!item} onClose={onClose} eyebrow="Перемещение ТМЦ" icon="transfer" title="Переместить единицу">
      <div className="mt-4 flex items-center gap-3 rounded-2xl well px-3.5 py-3">
        <Thumb emoji={item.emoji} hue={item.hue} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink-900">{item.categoryTitle}</div>
          <div className="font-mono text-[11px] text-ink-400">{item.inv}</div>
        </div>
        <Badge tone="mute">{from?.no}</Badge>
      </div>
      <Select
        label="Склад назначения"
        value={to}
        onChange={setTo}
        options={[{ value: '', label: '— выберите склад —' }, ...targets.map((w) => ({ value: w.id, label: `${w.no} · ${w.title}` }))]}
        className="mt-4"
      />
      <div className="mt-5 flex gap-2.5">
        <MetalButton className="flex-1 justify-center" onClick={onClose}>
          Отмена
        </MetalButton>
        <MossButton icon="transfer" trailing="arrowUR" className="flex-1 justify-center" onClick={() => to && onConfirm(item, to)}>
          Переместить
        </MossButton>
      </div>
    </Modal>
  )
}

export default function Nomenclature() {
  const { categories, items, addItem, moveItem, writeOff, warehouseById } = useStore()
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('all')
  const [sel, setSel] = useState(null)
  const [adding, setAdding] = useState(false)
  const [moving, setMoving] = useState(null)
  const [printing, setPrinting] = useState(null)
  const [toast, setToast] = useState(null)

  const flash = (t) => {
    setToast(t)
    setTimeout(() => setToast(null), 3600)
  }

  // актуальная выбранная единица (после мутаций)
  const selItem = useMemo(() => items.find((i) => i.id === sel) || null, [items, sel])
  const movingItem = useMemo(() => items.find((i) => i.id === moving) || null, [items, moving])
  const printingItem = useMemo(() => items.find((i) => i.id === printing) || null, [items, printing])

  const segOptions = [{ value: 'all', label: 'Все' }, ...[...new Set(categories.map((c) => c.group))].map((g) => ({ value: g, label: g }))]
  const norm = (s) => s.toLowerCase()

  const visibleCats = categories
    .map((c) => ({ c, list: items.filter((i) => i.categoryId === c.id && i.status !== 'writtenoff') }))
    .filter(({ c, list }) => {
      if (group !== 'all' && c.group !== group) return false
      if (!q) return true
      const hay = [c.title, c.group, ...list.flatMap((i) => [i.inv, i.serial, i.maker, i.barcode])].join(' ')
      return norm(hay).includes(norm(q))
    })

  const totalUnits = items.filter((i) => i.status !== 'writtenoff').length

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>
              <Icon name="book" size={12} /> Справочник номенклатуры ТМЦ
            </Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[38px]">Единый справочник</h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500">
              Родительские позиции и учёт отдельных единиц по заводским номерам с инвентарным номером, QR/штрих-кодом,
              гарантией и закупочной стоимостью.
            </p>
          </div>
          <MetalButton icon="plus" trailing="arrowUR" onClick={() => setAdding(true)}>
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
            {visibleCats.length} {plural(visibleCats.length, ['группа', 'группы', 'групп'])}
          </Badge>
          <Badge tone="mute" icon="package">
            {totalUnits} {plural(totalUnits, ['единица', 'единицы', 'единиц'])} всего
          </Badge>
        </div>
      </Reveal>

      <div className="space-y-3">
        {visibleCats.map(({ c, list }, i) => (
          <Reveal key={c.id} delay={40 + i * 35}>
            <CategoryCard c={c} items={list} onOpen={(it) => setSel(it.id)} defaultOpen={i === 0} />
          </Reveal>
        ))}
        {visibleCats.length === 0 && (q || group !== 'all') && (
          <Bezel>
            <div className="grid place-items-center py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl well text-ink-400">
                <Icon name="search" size={20} />
              </span>
              <p className="mt-3 text-sm text-ink-500">Ничего не найдено{q ? ` по запросу «${q}»` : ''}</p>
            </div>
          </Bezel>
        )}
        {categories.length === 0 && !q && group === 'all' && (
          <Bezel>
            <div className="grid place-items-center gap-3 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl well text-ink-400">
                <Icon name="book" size={22} />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink-900">Справочник пуст</p>
                <p className="mt-1 text-sm text-ink-500">Добавьте первую позицию номенклатуры ТМЦ</p>
              </div>
              <MetalButton icon="plus" trailing="arrowUR" onClick={() => setAdding(true)}>
                Добавить позицию
              </MetalButton>
            </div>
          </Bezel>
        )}
      </div>

      <ItemDrawer
        it={selItem}
        onClose={() => setSel(null)}
        onMove={(it) => setMoving(it.id)}
        onPrint={(it) => setPrinting(it.id)}
        onWriteOff={(it) => {
          const act = writeOff(it.id)
          setSel(null)
          flash({ title: `Акт ${act?.no} сформирован`, sub: 'единица списана, задача поставлена' })
        }}
      />

      <AddModal
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(data) => {
          const item = addItem(data)
          setAdding(false)
          flash({ title: `Позиция ${item.inv} добавлена`, sub: `в ${warehouseById(item.wh)?.no || 'склад'}` })
        }}
      />

      <MoveModal
        item={movingItem}
        onClose={() => setMoving(null)}
        onConfirm={(it, to) => {
          moveItem(it.id, to)
          setMoving(null)
          setSel(null)
          flash({ title: 'Единица перемещена', sub: `${it.inv} → ${warehouseById(to)?.no}` })
        }}
      />

      <PrintLabelModal item={printingItem} open={!!printing} onClose={() => setPrinting(null)} />

      <Toast open={!!toast} onClose={() => setToast(null)} title={toast?.title} sub={toast?.sub} />
    </div>
  )
}
