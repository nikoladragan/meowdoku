import type { ReactNode } from 'react'

interface IconProps {
  size?: number
  className?: string
}

function Icon({ size = 24, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const BackIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 5 L8 12 L15 19" />
  </Icon>
)

export const GearIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5 L13.6 5 L16.5 4.2 L17.2 7.1 L20 8 L19 10.8 L21.5 12.5 L19.3 14.5 L20 17.4 L17.1 17.8 L15.8 20.4 L13.2 19 L12 21.5 L10.8 19 L8.2 20.4 L6.9 17.8 L4 17.4 L4.7 14.5 L2.5 12.5 L5 10.8 L4 8 L6.8 7.1 L7.5 4.2 L10.4 5 Z" />
  </Icon>
)

export const UndoIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 14 L4 9 L9 4" />
    <path d="M4 9 H15 A5 5 0 0 1 15 19 H11" />
  </Icon>
)

export const BulbIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 18 H15 M10 21 H14" />
    <path d="M12 3 A6 6 0 0 0 8 13.5 C8.8 14.3 9 15 9 18 H15 C15 15 15.2 14.3 16 13.5 A6 6 0 0 0 12 3 Z" />
  </Icon>
)

export const SoundOnIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5 H8 L13 5 V19 L8 14.5 H4 Z" />
    <path d="M16 9 A4 4 0 0 1 16 15 M18.5 6.5 A8 8 0 0 1 18.5 17.5" />
  </Icon>
)

export const SoundOffIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5 H8 L13 5 V19 L8 14.5 H4 Z" />
    <path d="M17 9.5 L22 14.5 M22 9.5 L17 14.5" />
  </Icon>
)

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6 L18 18 M18 6 L6 18" />
  </Icon>
)

export const HelpIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5 A2.5 2.5 0 1 1 12.8 11.9 C12.2 12.3 12 12.7 12 13.5" />
    <path d="M12 17 V17.2" />
  </Icon>
)
