import { vibrationSupported } from '../../audio/haptics'
import type { Settings as SettingsData } from '../../game/types'
import { Dialog } from '../Dialog/Dialog'
import styles from './Settings.module.css'

interface Props {
  settings: SettingsData
  onChange: (next: SettingsData) => void
  onHowTo: () => void
  onClose: () => void
}

function Toggle({
  label,
  hint,
  checked,
  onToggle,
}: {
  label: string
  hint?: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={styles.row} onClick={onToggle}>
      <span className={styles.label}>
        {label}
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
      <span className={`${styles.switch} ${checked ? styles.on : ''}`} />
    </button>
  )
}

export function Settings({ settings, onChange, onHowTo, onClose }: Props) {
  return (
    <Dialog title="Settings" onClose={onClose}>
      <Toggle
        label="Sound"
        checked={!settings.muted}
        onToggle={() => onChange({ ...settings, muted: !settings.muted })}
      />
      {vibrationSupported() && (
        <Toggle
          label="Vibration"
          checked={settings.vibrate}
          onToggle={() => onChange({ ...settings, vibrate: !settings.vibrate })}
        />
      )}
      <Toggle
        label="Auto-cross"
        hint="Cross out cells a new cat rules out"
        checked={settings.autoCross}
        onToggle={() => onChange({ ...settings, autoCross: !settings.autoCross })}
      />
      <button type="button" className={styles.row} onClick={onHowTo}>
        <span className={styles.label}>How to play</span>
      </button>
    </Dialog>
  )
}
