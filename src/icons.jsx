// Ultra-light line icons (stroke 1.5, round joins). Hand-drawn to stay off the
// banned thick-Lucide / Material path. One <Icon name="..." /> component.

const P = {
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></>,
  book: <><path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5Z" /><path d="M5 17.5A2 2 0 0 1 7 16h11" /><path d="M9 8.5h6M9 11.5h4" /></>,
  boxes: <><path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5Z" /><path d="M3.5 8.5v7L12 20l8.5-4.5v-7" /><path d="M12 13v7" /></>,
  scan: <><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M4 12h16" /></>,
  chart: <><path d="M4 20V4M4 20h16" /><path d="M8 20v-6M12 20V8M16 20v-9" /></>,
  writeoff: <><path d="M14 3.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L14 3.5Z" /><path d="M14 3.5V8h4.5" /><path d="M9.5 14.5h5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  chevronR: <path d="m9 6 6 6-6 6" />,
  chevronD: <path d="m6 9 6 6 6-6" />,
  arrowUR: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
  clone: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  phone: <path d="M6.5 4.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 6.5a2 2 0 0 1 2-2Z" />,
  shield: <><path d="M12 3.5 19 6v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-2.5Z" /><path d="m9 11.5 2 2 4-4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  alert: <><path d="M12 4 2.5 20.5h19L12 4Z" /><path d="M12 10v4.5M12 17.5h.01" /></>,
  transfer: <><path d="M4 8h13M14 5l3 3-3 3" /><path d="M20 16H7M10 13l-3 3 3 3" /></>,
  camera: <><path d="M4.5 8h3l1.5-2.5h6L16.5 8h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-9A1.5 1.5 0 0 1 4.5 8Z" /><circle cx="12" cy="13" r="3.5" /></>,
  barcode: <><path d="M4 6v12M7 6v12M10 6v12M13.5 6v12M17 6v12M20 6v12" /></>,
  ruble: <><path d="M9 20V5h4.5a4 4 0 0 1 0 8H6.5M6.5 16.5H12" /></>,
  bell: <><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 5 2 6.5 2 6.5H4.5s2-1.5 2-6.5Z" /><path d="M10 19.5a2 2 0 0 0 4 0" /></>,
  filter: <path d="M4 5.5h16l-6.2 7.4V20l-3.6-2v-4.6L4 5.5Z" />,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  contract: <><path d="M7 3.5h7L19 8.5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V5a1.5 1.5 0 0 1 1.5-1.5Z" /><path d="M14 3.5V8h4.5M8.5 13h7M8.5 16.5h7" /></>,
  package: <><path d="M20 8.5 12 12 4 8.5 12 5l8 3.5Z" /><path d="M4 8.5v7l8 3.5 8-3.5v-7" /><path d="M8 6.8 16 10.2v3" /></>,
  pin: <><path d="M12 21s6.5-5.4 6.5-10A6.5 6.5 0 0 0 5.5 11c0 4.6 6.5 10 6.5 10Z" /><circle cx="12" cy="11" r="2.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  download: <><path d="M12 4v10m0 0 4-4m-4 4-4-4" /><path d="M5 19h14" /></>,
  layers: <><path d="m12 4 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4M4 16l8 4 8-4" /></>,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h3v3M20 14v.01M20 17v3h-3M17 20h-3" /></>,
}

export default function Icon({ name, className = '', size = 18, strokeWidth = 1.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name] ?? null}
    </svg>
  )
}
