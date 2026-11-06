import L from 'leaflet'

const icon = (html: string, w: number, h: number, ax = w / 2, ay = h / 2) =>
  L.divIcon({ className: 'sg-divicon', iconSize: [w, h], iconAnchor: [ax, ay], html })

/** Inflatable orange race mark with a label. */
export function raceMarkIcon(label: string, color = '#f97316', next = false): L.DivIcon {
  return icon(
    `<div style="position:relative;width:34px;height:40px">
      ${next ? '<span style="position:absolute;left:1px;top:7px;width:32px;height:32px;border-radius:50%;border:2px dashed #fde047;animation:rc-spin 6s linear infinite"></span>' : ''}
      <svg viewBox="0 0 34 40" width="34" height="40" style="position:absolute;inset:0;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.45))">
        <ellipse cx="17" cy="32" rx="8" ry="2.6" fill="rgba(0,0,0,.25)"/>
        <path d="M10 31 L13 15 Q17 11 21 15 L24 31 Q17 34 10 31Z" fill="${color}" stroke="#7c2d12" stroke-width="0.8"/>
        <path d="M12.2 22 Q17 24 21.8 22" fill="none" stroke="#fff" stroke-width="1.6"/>
      </svg>
      <span style="position:absolute;left:23px;top:0;font:700 11px system-ui;color:#0b3a5c;background:#fff;border-radius:4px;padding:0 3px;box-shadow:0 1px 2px rgba(0,0,0,.3)">${label}</span>
    </div>`,
    34,
    40,
    17,
    31,
  )
}

/** Committee / finish boat: small motor boat flying a flag. */
export function committeeIcon(label: string, flag: string): L.DivIcon {
  return icon(
    `<div style="position:relative;width:44px;height:40px">
      <svg viewBox="0 0 44 40" width="44" height="40" style="filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.45))">
        <path d="M6 28 H38 L34 34 H10Z" fill="#f8fafc" stroke="#334155" stroke-width="1"/>
        <rect x="15" y="22" width="12" height="6" rx="1" fill="#cbd5e1" stroke="#334155" stroke-width="0.8"/>
        <line x1="30" y1="28" x2="30" y2="8" stroke="#334155" stroke-width="1.4"/>
        <rect x="30" y="8" width="11" height="8" fill="${flag}" stroke="#334155" stroke-width="0.6"/>
      </svg>
      <span style="position:absolute;left:0;top:0;font:700 10px system-ui;color:#fff;background:#0b3a5c;border-radius:4px;padding:0 3px">${label}</span>
    </div>`,
    44,
    40,
    22,
    31,
  )
}

/** Small pin buoy at the other end of a line. */
export function pinBuoyIcon(color: string): L.DivIcon {
  return icon(
    `<svg viewBox="0 0 20 24" width="20" height="24" style="filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.45))">
      <ellipse cx="10" cy="19" rx="6" ry="2.2" fill="rgba(0,0,0,.25)"/>
      <circle cx="10" cy="13" r="6" fill="${color}" stroke="#334155" stroke-width="0.8"/>
      <line x1="10" y1="7" x2="10" y2="1" stroke="#334155" stroke-width="1.2"/>
      <path d="M10 1 L16 3.5 L10 6Z" fill="${color}"/>
    </svg>`,
    20,
    24,
    10,
    18,
  )
}
