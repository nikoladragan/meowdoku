export function Cross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} width="35%" height="35%" aria-hidden="true">
      <path
        d="M12 12 L88 88 M88 12 L12 88"
        stroke="var(--ink-soft)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
