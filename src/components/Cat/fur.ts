export type Fur = 'orange' | 'grey' | 'black' | 'cream'
export const FURS: Fur[] = ['orange', 'grey', 'black', 'cream']

interface Palette {
  fur: string
  muzzle: string
  eye: string
  pupil: string
}

export const PALETTES: Record<Fur, Palette> = {
  orange: { fur: '#f2a65a', muzzle: '#fbe3c4', eye: '#ffffff', pupil: '#3b2f2f' },
  grey: { fur: '#9aa0a8', muzzle: '#dfe2e6', eye: '#ffffff', pupil: '#3b2f2f' },
  black: { fur: '#3b3b45', muzzle: '#6b6b78', eye: '#ffe27a', pupil: '#1d1d24' },
  cream: { fur: '#f6e7cb', muzzle: '#fffaf0', eye: '#ffffff', pupil: '#3b2f2f' },
}

export const INK = '#3b2f2f'
