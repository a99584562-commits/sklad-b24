import { useEffect, useRef, useState } from 'react'
import Icon from './icons.jsx'

const ease = 'transition-all duration-500 ease-spring'

// ── Reveal: gentle fade-up on enter (IntersectionObserver, GPU-only) ─────────
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={className}
      style={
        seen
          ? { animation: `fade-up .7s cubic-bezier(0.32,0.72,0,1) both`, animationDelay: `${delay}ms` }
          : { opacity: 0 }
      }
    >
      {children}
    </Tag>
  )
}

// ── Double-Bezel card: aluminium tray holding a glass core ───────────────────
export function Bezel({ children, className = '', tone = 'plate', pad = 'p-5', interactive = false }) {
  return (
    <div
      className={`rounded-4xl bg-white/40 p-1.5 hairline backdrop-blur-[1px] ${
        interactive ? `${ease} hover:-translate-y-0.5` : ''
      } ${className}`}
    >
      <div className={`${tone} rounded-[1.625rem] ${pad} h-full`}>{children}</div>
    </div>
  )
}

// ── Buttons ──────────────────────────────────────────────────────────────────
export function MetalButton({ children, icon, trailing, onClick, className = '', size = 'md', active = false, title }) {
  const sizes = { sm: 'px-3.5 py-2 text-[13px]', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-[15px]' }
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`group inline-flex items-center gap-2 rounded-full font-semibold text-ink-900 ${ease} metal active:scale-[0.98] ${
        active ? 'ring-2 ring-moss-500/40' : ''
      } ${sizes[size]} ${className}`}
    >
      {icon && <Icon name={icon} size={16} className="text-ink-700" />}
      <span>{children}</span>
      {trailing && (
        <span
          className={`-mr-1.5 ml-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/[0.06] ${ease} group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:bg-ink-900/[0.1]`}
        >
          <Icon name={trailing} size={14} className="text-ink-700" />
        </span>
      )}
    </button>
  )
}

export function MossButton({ children, icon, trailing, onClick, className = '', size = 'md' }) {
  const sizes = { sm: 'px-3.5 py-2 text-[13px]', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-[15px]' }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full font-semibold ${ease} glass-moss active:scale-[0.98] ${sizes[size]} ${className}`}
    >
      {icon && <Icon name={icon} size={16} className="text-ink-900/75" />}
      <span>{children}</span>
      {trailing && (
        <span
          className={`-mr-1.5 ml-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/[0.12] ${ease} group-hover:translate-x-0.5 group-hover:-translate-y-px`}
        >
          <Icon name={trailing} size={14} className="text-ink-900" />
        </span>
      )}
    </button>
  )
}

export function IconButton({ icon, onClick, className = '', title, size = 16 }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-full text-ink-700 ${ease} metal active:scale-95 ${className}`}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}

// ── Pills / badges ────────────────────────────────────────────────────────────
export function Eyebrow({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-ink-900/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500 hairline ${className}`}
    >
      {children}
    </span>
  )
}

const TONES = {
  ok: 'bg-moss-50 text-moss-700 ring-moss-500/20',
  warn: 'bg-amber-400/15 text-amber-600 ring-amber-500/25',
  bad: 'bg-rose-500/10 text-rose-600 ring-rose-500/20',
  info: 'bg-sky-500/10 text-sky-700 ring-sky-500/20',
  mute: 'bg-ink-900/[0.05] text-ink-500 ring-ink-900/10',
  violet: 'bg-violet-500/10 text-violet-700 ring-violet-500/20',
}

export function Badge({ children, tone = 'mute', icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  )
}

// status of an inventory unit → badge
export const STATUS_META = {
  in: { tone: 'ok', label: 'В наличии', icon: 'check' },
  warn: { tone: 'warn', label: 'Гарантия ↓', icon: 'shield' },
  moved: { tone: 'info', label: 'Перемещён', icon: 'transfer' },
  broke: { tone: 'bad', label: 'Дефект', icon: 'alert' },
  writtenoff: { tone: 'mute', label: 'Списан', icon: 'writeoff' },
}

export function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.in
  return (
    <Badge tone={m.tone} icon={m.icon}>
      {m.label}
    </Badge>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ person, size = 36 }) {
  if (!person) return null
  const s = { width: size, height: size }
  return (
    <span
      style={{
        ...s,
        backgroundImage: `linear-gradient(150deg, hsl(${person.hue} 70% 62%), hsl(${person.hue + 24} 64% 46%))`,
      }}
      className="grid shrink-0 place-items-center rounded-full text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_4px_10px_-4px_rgba(20,23,28,.5)]"
    >
      {person.initials}
    </span>
  )
}

// ── Product thumbnail (photo placeholder) ─────────────────────────────────────
export function Thumb({ emoji, hue, size = 'md', className = '' }) {
  const px = { sm: 'h-10 w-10 text-lg', md: 'h-12 w-12 text-xl', lg: 'h-16 w-16 text-3xl' }[size]
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl well ${px} ${className}`}
      style={{ backgroundImage: `linear-gradient(160deg, hsl(${hue} 60% 96%), hsl(${hue} 38% 90%))` }}
    >
      <span className="drop-shadow-sm">{emoji}</span>
    </span>
  )
}

// ── Recessed input ────────────────────────────────────────────────────────────
export function SearchField({ value, onChange, placeholder = 'Поиск…', className = '' }) {
  return (
    <label className={`flex items-center gap-2.5 rounded-full well px-4 py-2.5 ${className}`}>
      <Icon name="search" size={16} className="text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
      />
    </label>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="group inline-flex items-center gap-3"
      aria-pressed={on}
    >
      <span
        className={`relative h-7 w-12 rounded-full ${ease} ${on ? 'glass-moss' : 'well'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full metal ${ease} ${on ? 'left-6' : 'left-1'}`}
        />
      </span>
      {label && <span className="text-sm font-medium text-ink-700">{label}</span>}
    </button>
  )
}

// ── Segmented control ─────────────────────────────────────────────────────────
export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-full well p-1 ${className}`}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${ease} ${
              active ? 'metal text-ink-900' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Tiny bar chart ────────────────────────────────────────────────────────────
export function Sparkbars({ data, max, className = '' }) {
  const top = max ?? Math.max(...data.map((d) => d.value), 1)
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end rounded-xl well p-1">
            <div
              className="w-full rounded-lg glass-moss"
              style={{ height: `${Math.max(8, (d.value / top) * 100)}%`, opacity: 0.55 + 0.45 * (d.value / top) }}
              title={`${d.value}`}
            />
          </div>
          <span className="text-[11px] font-medium text-ink-500">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// Progress meter
export function Meter({ value, tone = 'ok', className = '' }) {
  const colors = {
    ok: 'glass-moss',
    warn: 'bg-gradient-to-r from-amber-400 to-amber-500',
    bad: 'bg-gradient-to-r from-rose-400 to-rose-500',
  }
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full well ${className}`}>
      <div className={`h-full rounded-full ${colors[tone]} ${ease}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

// ── Modal (centered glass card, scrolls when taller than viewport) ────────────
export function Modal({ open, onClose, children, title, eyebrow, icon, maxW = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    // блокируем скролл фона, пока открыта модалка
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40">
      <div className="fixed inset-0 bg-ink-900/35 backdrop-blur-sm animate-[fade-up_.3s_ease]" onClick={onClose} />
      {/* прокручиваемый слой: центрирует короткие окна и скроллит длинные */}
      <div className="fixed inset-0 overflow-y-auto overscroll-contain" onClick={onClose}>
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative w-full ${maxW}`}
            style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="plate rounded-4xl p-5 hairline">
              <div className="flex items-start justify-between">
                <div>
                  {eyebrow && (
                    <Eyebrow>
                      {icon && <Icon name={icon} size={12} />} {eyebrow}
                    </Eyebrow>
                  )}
                  {title && <h3 className="mt-2 text-xl font-bold tracking-tight text-ink-900">{title}</h3>}
                </div>
                <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full metal text-ink-500 active:scale-95">
                  <Icon name="x" size={16} />
                </button>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Labeled field with recessed input ─────────────────────────────────────────
export function Field({ label, value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl well px-4 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400"
      />
    </label>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows = 2, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-2xl well px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400"
      />
    </label>
  )
}

export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl well px-4 py-2.5 pr-10 text-sm font-medium text-ink-900 outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
          <Icon name="chevronD" size={15} />
        </span>
      </div>
    </label>
  )
}

// ── Toast (floating pill, auto-dismiss handled by caller) ─────────────────────
export function Toast({ open, onClose, icon = 'check', title, sub, tone = 'moss' }) {
  if (!open) return null
  const bubble = tone === 'moss' ? 'glass-moss' : 'metal text-ink-700'
  return (
    <div
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      style={{ animation: 'fade-up .4s cubic-bezier(0.32,0.72,0,1) both' }}
    >
      <div className="flex items-center gap-3 rounded-full plate py-2.5 pl-3 pr-2.5 hairline">
        <span className={`grid h-9 w-9 place-items-center rounded-full ${bubble}`}>
          <Icon name={icon} size={16} />
        </span>
        <div className="text-sm">
          <span className="font-semibold text-ink-900">{title}</span>
          {sub && <span className="ml-1.5 text-ink-500">{sub}</span>}
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:text-ink-700">
          <Icon name="x" size={15} />
        </button>
      </div>
    </div>
  )
}

export { Icon }
