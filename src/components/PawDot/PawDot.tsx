export function PawDot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} width="34%" height="34%" aria-hidden="true">
      <g fill="var(--ink)" opacity="0.75">
        <ellipse cx="50" cy="66" rx="24" ry="19" />
        <ellipse cx="18" cy="40" rx="10" ry="13" />
        <ellipse cx="38" cy="22" rx="10" ry="13" />
        <ellipse cx="62" cy="22" rx="10" ry="13" />
        <ellipse cx="82" cy="40" rx="10" ry="13" />
      </g>
    </svg>
  )
}
