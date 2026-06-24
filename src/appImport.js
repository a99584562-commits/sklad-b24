// Разбор акта приёма-передачи (АПП .docx) на стороне браузера.
// Достаём номер/дату договора, номер апартамента и таблицу оборудования.
// jszip грузится лениво — только при фактическом разборе файла.
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

const textOf = (el) => Array.from(el.getElementsByTagNameNS(W, 't')).map((t) => t.textContent).join('')
const cellText = (tc) =>
  Array.from(tc.getElementsByTagNameNS(W, 'p'))
    .map((p) => textOf(p))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

// "05.06.2026" → "2026-06-05"
export function ruDateToISO(s) {
  const m = String(s || '').match(/(\d{2})\.(\d{2})\.(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

export async function parseApp(file) {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(file)
  const entry = zip.file('word/document.xml')
  if (!entry) throw new Error('Это не похоже на .docx (нет word/document.xml)')
  const xml = await entry.async('string')
  const doc = new DOMParser().parseFromString(xml, 'application/xml')

  const fullText = Array.from(doc.getElementsByTagNameNS(W, 't')).map((t) => t.textContent).join(' ')
  const noMatch = fullText.match(/№\s*([A-Za-zА-Яа-я0-9\-]+)\s*от\s*(\d{2}\.\d{2}\.\d{4})/)
  const transferMatch = fullText.match(/фактически было передано\s*(\d{2}\.\d{2}\.\d{4})/)
  const appNo = noMatch ? noMatch[1] : ''
  const appDate = ruDateToISO(transferMatch ? transferMatch[1] : noMatch ? noMatch[2] : '')

  // номер апартамента: 5-й сегмент кода (ЗН1АП-7-6-36-636-ДА-М → 636)
  const segs = appNo.split('-')
  let apt = segs.length > 4 ? segs[4] : ''

  // таблица оборудования: заголовок содержит «Номенклатура» и «Количество»
  const tables = Array.from(doc.getElementsByTagNameNS(W, 'tbl'))
  let items = []
  let address = ''
  for (const tbl of tables) {
    const rows = Array.from(tbl.getElementsByTagNameNS(W, 'tr'))
    if (!rows.length) continue
    const hdr = Array.from(rows[0].getElementsByTagNameNS(W, 'tc')).map(cellText)
    // справочная таблица с адресом/условным номером
    if (hdr.includes('Условный (гостиничный) номер') || hdr.includes('Адрес')) {
      const r1 = Array.from(rows[1]?.getElementsByTagNameNS(W, 'tc') || []).map(cellText)
      const ai = hdr.indexOf('Адрес')
      if (ai >= 0 && r1[ai]) address = r1[ai]
      const ui = hdr.indexOf('Условный (гостиничный) номер')
      if (!apt && ui >= 0 && r1[ui]) apt = r1[ui]
      continue
    }
    const ni = hdr.indexOf('Номенклатура')
    const qi = hdr.indexOf('Количество')
    if (ni < 0 || qi < 0) continue
    const gi = hdr.indexOf('Категория')
    const zi = hdr.indexOf('Тип помещения')
    const uci = hdr.indexOf('Ед.измерения')
    // «Категория»/«Зона» в акте объединены по вертикали — текст лишь в первой строке блока.
    // Протягиваем вниз последнее непустое значение.
    let lastGroup = ''
    let lastZone = ''
    for (const r of rows.slice(1)) {
      const c = Array.from(r.getElementsByTagNameNS(W, 'tc')).map(cellText)
      const name = c[ni]
      if (!name) continue
      const qty = parseInt(String(c[qi]).replace(',', '.'), 10) || 0
      if (qty <= 0) continue
      if (gi >= 0 && c[gi]) lastGroup = c[gi]
      if (zi >= 0 && c[zi]) lastZone = c[zi]
      items.push({ group: lastGroup, zone: lastZone, name, unit: uci >= 0 ? c[uci] : 'Шт.', qty })
    }
  }

  return { appNo, appDate, apt, address, items, totalQty: items.reduce((s, i) => s + i.qty, 0) }
}
