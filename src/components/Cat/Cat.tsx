import type { Fur } from './fur'

interface Palette {
  fur: string
  muzzle: string
  eye: string
  pupil: string
}

const PALETTES: Record<Fur, Palette> = {
  orange: { fur: '#f2a65a', muzzle: '#fbe3c4', eye: '#ffffff', pupil: '#3b2f2f' },
  grey: { fur: '#9aa0a8', muzzle: '#dfe2e6', eye: '#ffffff', pupil: '#3b2f2f' },
  black: { fur: '#3b3b45', muzzle: '#6b6b78', eye: '#ffe27a', pupil: '#1d1d24' },
  cream: { fur: '#f6e7cb', muzzle: '#fffaf0', eye: '#ffffff', pupil: '#3b2f2f' },
}

const INK = '#3b2f2f'
const INNER_EAR = '#f5a9b8'

// The cat drawn in a 100x100 box, as a group so other illustrations can reuse it.
export function CatShape({ fur }: { fur: Fur }) {
  const p = PALETTES[fur]
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* body */}
      <ellipse cx="50" cy="80" rx="25" ry="17" fill={p.fur} stroke={INK} strokeWidth="4" />
      {/* ears */}
      <path d="M20 42 L22 10 L46 26 Z" fill={p.fur} stroke={INK} strokeWidth="4" />
      <path d="M80 42 L78 10 L54 26 Z" fill={p.fur} stroke={INK} strokeWidth="4" />
      <path d="M26 34 L26.5 19 L38 27 Z" fill={INNER_EAR} />
      <path d="M74 34 L73.5 19 L62 27 Z" fill={INNER_EAR} />
      {/* head */}
      <ellipse cx="50" cy="50" rx="33" ry="28" fill={p.fur} stroke={INK} strokeWidth="4" />
      {/* muzzle */}
      <ellipse cx="50" cy="61" rx="13" ry="9" fill={p.muzzle} />
      {/* eyes */}
      <ellipse cx="36" cy="48" rx="6.5" ry="7.5" fill={p.eye} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="64" cy="48" rx="6.5" ry="7.5" fill={p.eye} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="37" cy="49" rx="3.2" ry="5" fill={p.pupil} />
      <ellipse cx="63" cy="49" rx="3.2" ry="5" fill={p.pupil} />
      <circle cx="38" cy="46.5" r="1.4" fill="#fff" />
      <circle cx="64" cy="46.5" r="1.4" fill="#fff" />
      {/* nose and mouth */}
      <path d="M46.5 57 L53.5 57 L50 61.5 Z" fill={INNER_EAR} stroke={INK} strokeWidth="2" />
      <path d="M50 61.5 L50 65 M50 65 Q45 69 41 65 M50 65 Q55 69 59 65" fill="none" stroke={INK} strokeWidth="2.5" />
      {/* whiskers */}
      <path d="M26 58 L12 55 M26 63 L13 66 M74 58 L88 55 M74 63 L87 66" fill="none" stroke={INK} strokeWidth="2" />
    </g>
  )
}

export function Cat({ fur, className }: { fur: Fur; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} width="100%" height="100%" aria-hidden="true">
      <CatShape fur={fur} />
    </svg>
  )
}
