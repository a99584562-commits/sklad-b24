import { useState } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { qrPayload } from './codes.jsx'
import { Modal, MetalButton, MossButton, Segmented, Icon } from './ui.jsx'

// Форматы этикеток (43×25 — рулон клиента под TSC TE200, по умолчанию)
export const LABEL_SIZES = [
  { id: '43x25', w: 43, h: 25, label: '43 × 25' },
  { id: '58x40', w: 58, h: 40, label: '58 × 40' },
  { id: '30x20', w: 30, h: 20, label: '30 × 20' },
]

const MM_PX = 3.7795 // 1mm в CSS-пикселях (96dpi) — совпадает для экрана и печати

// Одна этикетка точного физического размера, монохром (термопринтер печатает чёрным)
export function Label({ item, w, h }) {
  const pad = +(h * 0.06).toFixed(2)
  const qrMm = +((h - pad * 2) * 0.98).toFixed(2)
  const qrPx = Math.round(qrMm * MM_PX)
  const nameF = (h * 0.082).toFixed(2)
  const invF = (h * 0.13).toFixed(2)
  const footF = (h * 0.056).toFixed(2)
  return (
    <div
      style={{
        width: `${w}mm`,
        height: `${h}mm`,
        padding: `${pad}mm`,
        display: 'flex',
        alignItems: 'center',
        gap: `${pad * 1.1}mm`,
        boxSizing: 'border-box',
        background: '#fff',
        color: '#000',
        fontFamily: 'Stolzl, "Plus Jakarta Sans", sans-serif',
      }}
    >
      <div style={{ width: `${qrMm}mm`, height: `${qrMm}mm`, flex: 'none' }}>
        <QRCodeSVG
          value={qrPayload(item.inv)}
          size={qrPx}
          level="M"
          marginSize={0}
          fgColor="#000000"
          bgColor="#ffffff"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.12 }}>
        <div
          style={{
            fontSize: `${nameF}mm`,
            fontWeight: 600,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.categoryTitle}
        </div>
        <div
          style={{
            fontSize: `${invF}mm`,
            fontWeight: 700,
            fontFamily: '"JetBrains Mono", monospace',
            marginTop: `${(h * 0.025).toFixed(2)}mm`,
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
          }}
        >
          {item.inv}
        </div>
        <div
          style={{
            fontSize: `${footF}mm`,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: `${(h * 0.035).toFixed(2)}mm`,
          }}
        >
          25/7 · склад
        </div>
      </div>
    </div>
  )
}

export function PrintLabelModal({ item, open, onClose }) {
  const [sizeId, setSizeId] = useState('43x25')
  const [copies, setCopies] = useState(1)
  const size = LABEL_SIZES.find((s) => s.id === sizeId)

  if (!open || !item) return null

  const n = Math.max(1, Math.min(50, copies || 1))
  // масштаб превью так, чтобы по ширине влезало в модалку
  const scale = Math.min(3.2, 360 / (size.w * MM_PX))
  const prevW = size.w * MM_PX * scale
  const prevH = size.h * MM_PX * scale

  const doPrint = () => {
    let st = document.getElementById('label-page-style')
    if (!st) {
      st = document.createElement('style')
      st.id = 'label-page-style'
      document.head.appendChild(st)
    }
    st.textContent = `@page { size: ${size.w}mm ${size.h}mm; margin: 0; }`
    window.print()
  }

  return (
    <>
      <Modal open={open} onClose={onClose} eyebrow="Печать этикетки" icon="printer" title="Этикетка ТМЦ" maxW="max-w-md">
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Размер этикетки, мм</div>
          <Segmented options={LABEL_SIZES.map((s) => ({ value: s.id, label: s.label }))} value={sizeId} onChange={setSizeId} />
        </div>

        {/* превью этикетки в реальных пропорциях */}
        <div className="mt-4 grid place-items-center rounded-3xl well p-5">
          <div style={{ width: prevW, height: prevH, position: 'relative' }}>
            <div
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}
              className="rounded-[2px] shadow-[0_4px_14px_-6px_rgba(20,23,28,.4)] ring-1 ring-ink-900/10"
            >
              <Label item={item} w={size.w} h={size.h} />
            </div>
          </div>
        </div>
        <div className="mt-1.5 text-center text-[11px] text-ink-400">
          QR кодирует инв. номер · печать монохром (термо)
        </div>

        {/* копии */}
        <div className="mt-4 flex items-center justify-between rounded-2xl well px-4 py-2.5">
          <span className="text-sm font-medium text-ink-700">Копий</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCopies((c) => Math.max(1, (c || 1) - 1))} className="grid h-8 w-8 place-items-center rounded-full metal text-ink-700 active:scale-95">
              <Icon name="x" size={13} className="rotate-45" />
            </button>
            <span className="w-8 text-center font-mono text-sm font-bold text-ink-900">{n}</span>
            <button onClick={() => setCopies((c) => Math.min(50, (c || 1) + 1))} className="grid h-8 w-8 place-items-center rounded-full metal text-ink-700 active:scale-95">
              <Icon name="plus" size={14} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <MetalButton className="flex-1 justify-center" onClick={onClose}>
            Отмена
          </MetalButton>
          <MossButton icon="printer" trailing="arrowUR" className="flex-1 justify-center" onClick={doPrint}>
            Печать
          </MossButton>
        </div>
      </Modal>

      {/* лист этикеток для печати — портал в body, виден только при печати */}
      {createPortal(
        <div id="label-sheet">
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="print-label" style={{ width: `${size.w}mm`, height: `${size.h}mm` }}>
              <Label item={item} w={size.w} h={size.h} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
