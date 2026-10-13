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
    <path d="M9.78 4.73 L10.40 1.93 L13.60 1.93 L14.22 4.73 A7.6 7.6 0 0 1 15.57 5.29 L18.00 3.75 L20.25 6.00 L18.71 8.43 A7.6 7.6 0 0 1 19.27 9.78 L22.07 10.40 L22.07 13.60 L19.27 14.22 A7.6 7.6 0 0 1 18.71 15.57 L20.25 18.00 L18.00 20.25 L15.57 18.71 A7.6 7.6 0 0 1 14.22 19.27 L13.60 22.07 L10.40 22.07 L9.78 19.27 A7.6 7.6 0 0 1 8.43 18.71 L6.00 20.25 L3.75 18.00 L5.29 15.57 A7.6 7.6 0 0 1 4.73 14.22 L1.93 13.60 L1.93 10.40 L4.73 9.78 A7.6 7.6 0 0 1 5.29 8.43 L3.75 6.00 L6.00 3.75 L8.43 5.29 A7.6 7.6 0 0 1 9.78 4.73 Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const UndoIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 14 L4 9 L9 4" />
    <path d="M4 9 H15 A5 5 0 0 1 15 19 H11" />
  </Icon>
)

export const RestartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12 A9 9 0 1 0 12 3 C9.5 3 7.1 4 5.3 5.7 L3 8" />
    <path d="M3 3 V8 H8" />
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
