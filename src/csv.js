// Простой CSV-экспорт с BOM (чтобы кириллица корректно открывалась в Excel).
// Разделитель «;» — стандарт для русской локали Excel.
export function toCSV(headers, rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",;\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const lines = [headers.map(esc).join(';'), ...rows.map((r) => r.map(esc).join(';'))]
  return '﻿' + lines.join('\r\n')
}

export function downloadFile(filename, content, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
