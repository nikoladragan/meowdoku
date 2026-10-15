import { REGION_NAMES } from '../../game/regionStyle'
import { Cat } from '../Cat/Cat'
import { FURS } from '../Cat/fur'
import { Cross } from '../Cross/Cross'
import { FishCracker } from '../FishCracker/FishCracker'
import { ICONS } from '../icons/iconList'
import { PawDot } from '../PawDot/PawDot'
import { TitleCat } from '../TitleCat/TitleCat'
import styles from './ArtGallery.module.css'

const COLORS = REGION_NAMES.map((_, i) => i)

function Swatch({ color, size, children }: { color: number; size: 's5' | 's10'; children: React.ReactNode }) {
  return (
    <div
      className={`${styles.swatch} ${styles[size]}`}
      style={{ '--bg-c': `var(--region-${color})` } as React.CSSProperties}
      title={REGION_NAMES[color]}
    >
      {children}
    </div>
  )
}

// Dev-only (?art): every cat, mark and icon, for judging the artwork.
export function ArtGallery() {
  return (
    <div className={styles.gallery}>
      <h1>Art gallery</h1>
      <div className={styles.hero}>
        <TitleCat />
      </div>

      <h2>Cats at 5×5 cell size</h2>
      {FURS.map((fur) => (
        <div key={fur}>
          <h3>{fur}</h3>
          <div className={`${styles.row} ${styles.row5}`}>
            {COLORS.map((c) => (
              <Swatch key={c} color={c} size="s5">
                <Cat fur={fur} seed={c} />
              </Swatch>
            ))}
          </div>
        </div>
      ))}

      <h2>Cats at 10×10 cell size</h2>
      {FURS.map((fur) => (
        <div key={fur}>
          <h3>{fur}</h3>
          <div className={`${styles.row} ${styles.row10}`}>
            {COLORS.map((c) => (
              <Swatch key={c} color={c} size="s10">
                <Cat fur={fur} seed={c} />
              </Swatch>
            ))}
          </div>
        </div>
      ))}

      <h2>Cross</h2>
      <div className={`${styles.row} ${styles.row5}`}>
        {COLORS.map((c) => (
          <Swatch key={c} color={c} size="s5">
            <Cross />
          </Swatch>
        ))}
      </div>

      <h2>Paw dot (debug marker)</h2>
      <div className={`${styles.row} ${styles.row5}`}>
        {COLORS.map((c) => (
          <Swatch key={c} color={c} size="s5">
            <PawDot />
          </Swatch>
        ))}
      </div>

      <h2>Fish crackers</h2>
      <div className={styles.crackers}>
        <div className={styles.icon}>
          <FishCracker size={40} />
          full
        </div>
        <div className={styles.icon}>
          <FishCracker lost size={40} />
          lost
        </div>
        <div className={styles.icon}>
          <FishCracker size={22} />
          <FishCracker lost size={22} />
          header size
        </div>
      </div>

      <h2>Icons</h2>
      <div className={styles.icons}>
        {Object.entries(ICONS).map(([name, I]) => (
          <div key={name} className={styles.icon}>
            <I size={32} />
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}
