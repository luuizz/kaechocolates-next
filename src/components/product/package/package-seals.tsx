type HighInSealProps = { sugar: boolean; fat: boolean }

const WARNINGS = [
  { key: 'sugar', lines: ['AÇÚCAR', 'ADICIONADO'], width: 64 },
  { key: 'fat', lines: ['GORDURA', 'SATURADA'], width: 66 },
] as const

export function HighInSeal({ sugar, fat }: HighInSealProps) {
  const active = WARNINGS.filter((item) => (item.key === 'sugar' ? sugar : fat))
  if (!active.length) return null
  const boxes = active.reduce<{ x: number; item: (typeof WARNINGS)[number] }[]>((list, item) => {
    const last = list.at(-1)
    return [...list, { x: last ? last.x + last.item.width + 3 : 117, item }]
  }, [])
  const end = boxes.at(-1)!
  const width = end.x + end.item.width + 4 - 44
  return (
    <g
      className="font-package"
      fontWeight={700}
      textAnchor="middle"
      fill="#111"
      transform={`translate(${(210 - width) / 2} 0)`}
    >
      <rect x="44" y="14" width={width} height="29" rx="4" fill="#fff" stroke="#111" strokeWidth="1.6" />
      <circle cx="54" cy="25" r="6" fill="none" stroke="#111" strokeWidth="1.8" />
      <line x1="49.5" y1="29.5" x2="45.5" y2="36" stroke="#111" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="62" y="18" width="52" height="21" rx="2" fill="#fff" stroke="#111" strokeWidth="1.4" />
      <text x="88" y="31.5" fontSize="8.6">
        ALTO EM
      </text>
      {boxes.map(({ x, item }) => (
        <g key={item.key}>
          <rect x={x} y="18" width={item.width} height="21" rx="2" fill="#111" />
          <text x={x + item.width / 2} y="27" fontSize="7.2" fill="#fff">
            {item.lines[0]}
          </text>
          <text x={x + item.width / 2} y="35.5" fontSize="7.2" fill="#fff">
            {item.lines[1]}
          </text>
        </g>
      ))}
    </g>
  )
}

export function CraftSeal({ id }: { id: string }) {
  return (
    <g className="font-package">
      <path id={`${id}-sup`} d="M243 383 A12 12 0 0 1 267 383" fill="none" />
      <path id={`${id}-inf`} d="M241.5 383 A13.5 13.5 0 0 0 268.5 383" fill="none" />
      <circle cx="255" cy="383" r="18" fill="#d8a640" />
      <circle cx="255" cy="383" r="16" fill="none" stroke="#f3d48a" strokeWidth="0.5" />
      <text fontSize="3.6" fontWeight={700} fill="#3b2a0c" letterSpacing="0.3">
        <textPath href={`#${id}-sup`} startOffset="50%" textAnchor="middle">
          CHOCOLATE
        </textPath>
      </text>
      <text fontSize="3.6" fontWeight={700} fill="#3b2a0c" letterSpacing="0.3">
        <textPath href={`#${id}-inf`} startOffset="50%" textAnchor="middle">
          ARTESANAL
        </textPath>
      </text>
      <path
        d="M255 377 C251.5 380 251.5 385 255 389 C258.5 385 258.5 380 255 377 Z M255 379 V388"
        fill="none"
        stroke="#3b2a0c"
        strokeWidth="0.8"
      />
    </g>
  )
}

const FREE_FROM = [
  {
    x: 60,
    label: 'GLÚTEN',
    icon: 'M60 482 V471 M60 474 L57.5 472 M60 474 L62.5 472 M60 477 L57.5 475 M60 477 L62.5 475 M60 480 L57.5 478 M60 480 L62.5 478',
  },
  {
    x: 117,
    label: 'CONSERVANTES',
    icon: 'M114.5 471 H119.5 M115 471 V481.5 Q115 483 117 483 Q119 483 119 481.5 V471 M115 477 H119',
  },
  {
    x: 183,
    label: 'AROMATIZANTES',
    icon: 'M181.5 470.5 H184.5 M182 470.5 V474 L178.5 481 Q178 483 180 483 H186 Q188 483 187.5 481 L184 474 V470.5',
  },
]

export function FreeFromIcons() {
  return (
    <g className="font-package">
      {FREE_FROM.map(({ x, label, icon }) => (
        <g key={label}>
          <g fill="none" stroke="#333" strokeWidth="0.9" strokeLinecap="round">
            <circle cx={x} cy="477" r="8.5" />
            <path d={icon} />
            <line x1={x - 6} y1="471" x2={x + 6} y2="483" />
          </g>
          <text x={x + 11} y="476" fontSize="4.3" fontWeight={600} fill="#333">
            LIVRE DE
          </text>
          <text x={x + 11} y="481" fontSize="4.3" fontWeight={600} fill="#333">
            {label}
          </text>
        </g>
      ))}
    </g>
  )
}
