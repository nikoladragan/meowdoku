import { CatShape } from '../Cat/Cat'

// Larger sitting cat for the Home screen: the cat face plus a curled tail and front paws.
export function TitleCat({ size = 140 }: { size?: number }) {
  return (
    <svg viewBox="0 0 150 120" width={size * 1.25} height={size} aria-hidden="true">
      <path
        d="M96 98 C130 100 140 70 124 58 C118 54 112 60 118 66"
        fill="none"
        stroke="#3b2f2f"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M96 98 C130 100 140 70 124 58 C118 54 112 60 118 66"
        fill="none"
        stroke="#f2a65a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <svg x="15" y="0" width="120" height="120" viewBox="0 0 100 100">
        <CatShape fur="orange" />
      </svg>
      <g fill="#f2a65a" stroke="#3b2f2f" strokeWidth="3.5" strokeLinejoin="round">
        <ellipse cx="62" cy="108" rx="10" ry="7" />
        <ellipse cx="88" cy="108" rx="10" ry="7" />
      </g>
    </svg>
  )
}
