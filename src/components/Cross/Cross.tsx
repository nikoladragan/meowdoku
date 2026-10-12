export function Cross({ miss = false }: { miss?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="35%" height="35%" aria-hidden="true">
      <path
        d="M12 12 L88 88 M88 12 L12 88"
        stroke={miss ? 'var(--danger)' : 'var(--ink-soft)'}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
