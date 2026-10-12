import { CatShape } from '../Cat/Cat'
import { INK, PALETTES } from '../Cat/fur'

const FUR = 'orange'
const TAIL = 'M96 98 C130 100 140 70 124 58 C118 54 112 60 118 66'

// Larger sitting cat for the Home screen: the cat face plus a curled tail and front paws.
export function TitleCat({ size = 140 }: { size?: number }) {
  const fur = PALETTES[FUR].fur
  return (
    <svg viewBox="0 0 150 120" width={size * 1.25} height={size} aria-hidden="true">
      <path d={TAIL} fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
      <path d={TAIL} fill="none" stroke={fur} strokeWidth="6" strokeLinecap="round" />
      <svg x="15" y="0" width="120" height="120" viewBox="0 0 100 100">
        <CatShape fur={FUR} />
      </svg>
      <g fill={fur} stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <ellipse cx="62" cy="108" rx="10" ry="7" />
        <ellipse cx="88" cy="108" rx="10" ry="7" />
      </g>
    </svg>
  )
}
