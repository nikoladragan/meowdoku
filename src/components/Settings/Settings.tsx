import type { Settings as SettingsData } from '../../game/types'
import { Dialog } from '../Dialog/Dialog'
import styles from './Settings.module.css'

interface Props {
  settings: SettingsData
  onChange: (next: SettingsData) => void
  onHowTo: () => void
  onClose: () => void
}

export function Settings({ settings, onChange, onHowTo, onClose }: Props) {
  return (
    <Dialog title="Settings" onClose={onClose}>
      <button
        type="button"
        role="switch"
        aria-checked={settings.autoCross}
        className={styles.row}
        onClick={() => onChange({ ...settings, autoCross: !settings.autoCross })}
      >
        <span className={styles.label}>
          Auto-cross
          <span className={styles.hint}>Cross out cells a new cat rules out</span>
        </span>
        <span className={`${styles.switch} ${settings.autoCross ? styles.on : ''}`} />
      </button>
      <button type="button" className={styles.row} onClick={onHowTo}>
        <span className={styles.label}>How to play</span>
      </button>
    </Dialog>
  )
}
