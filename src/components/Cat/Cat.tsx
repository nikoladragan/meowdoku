import { INK, PALETTES, type Fur } from './fur'
import styles from './Cat.module.css'

const INNER_EAR = '#f5a9b8'

// The cat drawn in a 100x100 box, as a group so other illustrations can reuse it.
export function CatShape({ fur }: { fur: Fur }) {
  const p = PALETTES[fur]
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* body */}
      <ellipse cx="50" cy="80" rx="25" ry="17" fill={p.fur} stroke={INK} strokeWidth="4" />
      {/* ears */}
      <g className={styles.ear}>
        <path d="M20 42 L22 10 L46 26 Z" fill={p.fur} stroke={INK} strokeWidth="4" />
        <path d="M26 34 L26.5 19 L38 27 Z" fill={INNER_EAR} />
      </g>
      <g className={`${styles.ear} ${styles.right}`}>
        <path d="M80 42 L78 10 L54 26 Z" fill={p.fur} stroke={INK} strokeWidth="4" />
        <path d="M74 34 L73.5 19 L62 27 Z" fill={INNER_EAR} />
      </g>
      {/* head */}
      <ellipse cx="50" cy="50" rx="33" ry="28" fill={p.fur} stroke={INK} strokeWidth="4" />
      {/* muzzle */}
      <ellipse cx="50" cy="61" rx="13" ry="9" fill={p.muzzle} />
      {/* eyes */}
      <g className={styles.eye}>
        <ellipse cx="36" cy="48" rx="6.5" ry="7.5" fill={p.eye} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="37" cy="49" rx="3.2" ry="5" fill={p.pupil} />
        <circle cx="38" cy="46.5" r="1.4" fill="#fff" />
      </g>
      <g className={styles.eye}>
        <ellipse cx="64" cy="48" rx="6.5" ry="7.5" fill={p.eye} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="63" cy="49" rx="3.2" ry="5" fill={p.pupil} />
        <circle cx="64" cy="46.5" r="1.4" fill="#fff" />
      </g>
      {/* nose and mouth */}
      <path d="M46.5 57 L53.5 57 L50 61.5 Z" fill={INNER_EAR} stroke={INK} strokeWidth="2" />
      <path d="M50 61.5 L50 65 M50 65 Q45 69 41 65 M50 65 Q55 69 59 65" fill="none" stroke={INK} strokeWidth="2.5" />
      {/* whiskers */}
      <path className={styles.whiskers} d="M26 58 L12 55 M26 63 L13 66" fill="none" stroke={INK} strokeWidth="2" />
      <path
        className={`${styles.whiskers} ${styles.right}`}
        d="M74 58 L88 55 M74 63 L87 66"
        fill="none"
        stroke={INK}
        strokeWidth="2"
      />
    </g>
  )
}

// Three numbers from 0 to 1 that differ from one seed to the next. They set when each idle
// animation runs, so cats with different seeds do not blink and twitch together.
function idleTiming(seed: number): React.CSSProperties {
  const spread = (step: number) => ((seed + 1) * step) % 1
  return { '--cat-a': spread(0.618), '--cat-b': spread(0.414), '--cat-c': spread(0.732) } as React.CSSProperties
}

export function Cat({ fur, seed = 0 }: { fur: Fur; seed?: number }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={idleTiming(seed)}>
      <CatShape fur={fur} />
    </svg>
  )
}
