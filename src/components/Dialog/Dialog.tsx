import type { ReactNode } from 'react'
import { CloseIcon } from '../icons/icons'
import styles from './Dialog.module.css'

interface Props {
  title: string
  children: ReactNode
  // When set, the backdrop and a close button dismiss the sheet.
  onClose?: () => void
}

// Bottom sheet used for every dialog in the app.
export function Dialog({ title, children, onClose }: Props) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>{title}</h2>
        {onClose && (
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
