const TRACK_WIDTH = 44
const TRACK_HEIGHT = 24
const THUMB_SIZE = 20
const THUMB_INSET = (TRACK_HEIGHT - THUMB_SIZE) / 2 // 2px, centers thumb vertically in the track
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2 // 20px, exact distance from left rest to right rest

export default function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        backgroundColor: checked ? 'var(--color-moss)' : 'var(--color-line)',
        transition: 'background-color 250ms ease',
      }}
      className="relative shrink-0 rounded-full overflow-hidden box-border"
    >
      <span
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          top: THUMB_INSET,
          left: THUMB_INSET,
          transform: `translateX(${checked ? THUMB_TRAVEL : 0}px)`,
          transition: 'transform 250ms ease',
        }}
        className="absolute rounded-full bg-white shadow"
      />
    </button>
  )
}
