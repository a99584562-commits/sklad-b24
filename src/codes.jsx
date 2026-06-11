import { useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import JsBarcode from 'jsbarcode'

// Полезная нагрузка QR: префикс + инвентарный номер (его и ищет сканер)
export const qrPayload = (inv) => `SKLAD:${inv}`
export const parseScan = (text) => {
  if (!text) return ''
  const t = String(text).trim()
  return t.startsWith('SKLAD:') ? t.slice(6) : t
}

// Настоящий сканируемый QR-код
export function QR({ value, size = 132, className = '' }) {
  return (
    <div className={`grid place-items-center rounded-2xl bg-white p-3 ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        marginSize={0}
        fgColor="#15171c"
        bgColor="#ffffff"
      />
    </div>
  )
}

// Настоящий штрих-код Code128 (любая строка, без проблем с контрольной суммой EAN)
export function Barcode({ value, height = 52, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    try {
      JsBarcode(ref.current, String(value || '0'), {
        format: 'CODE128',
        height,
        width: 1.8,
        margin: 0,
        displayValue: false,
        lineColor: '#15171c',
        background: 'transparent',
      })
    } catch {
      /* invalid value — ничего не рисуем */
    }
  }, [value, height])
  return (
    <div className={`flex items-center justify-center rounded-2xl bg-white px-3 py-2.5 ${className}`}>
      <svg ref={ref} className="h-auto max-w-full" />
    </div>
  )
}
