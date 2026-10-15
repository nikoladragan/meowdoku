export function FishCracker({ lost = false, size = 28 }: { lost?: boolean; size?: number }) {
  return (
    <svg
      viewBox="0 0 48 32"
      width={size * 1.5}
      height={size}
      role="img"
      aria-label={lost ? 'Lost cracker' : 'Cracker left'}
    >
      {lost ? (
        <g
          fill="none"
          stroke="var(--ink-soft)"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.5"
          strokeLinejoin="round"
        >
          <path d="M3 16 C10 4 26 3 35 14 L45 5 L45 27 L35 18 C26 29 10 28 3 16 Z" />
        </g>
      ) : (
        <g strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M3 16 C10 4 26 3 35 14 L45 5 L45 27 L35 18 C26 29 10 28 3 16 Z"
            fill="var(--accent)"
            stroke="var(--ink)"
            strokeWidth="2.5"
          />
          <circle cx="12" cy="14" r="2" fill="var(--ink)" />
          <path
            d="M20 9 Q24 16 20 23 M27 10 Q31 16 27 22"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.8"
            opacity="0.5"
          />
        </g>
      )}
    </svg>
  )
}
