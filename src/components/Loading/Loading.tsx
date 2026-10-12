import { TitleCat } from '../TitleCat/TitleCat'
import styles from './Loading.module.css'

export function Loading() {
  return (
    <div className={styles.loading} role="status">
      <div className={styles.cat}>
        <TitleCat size={90} />
      </div>
      <span>Herding cats...</span>
    </div>
  )
}
