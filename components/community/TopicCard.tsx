'use client'

const BG_COLORS = [
  'rgba(30, 29, 26, 0.55)',
  'rgba(32, 31, 28, 0.55)',
  'rgba(28, 27, 24, 0.55)',
  'rgba(33, 31, 28, 0.55)',
]
const BG_HOVER = [
  'rgba(37, 36, 32, 0.65)',
  'rgba(37, 36, 32, 0.65)',
  'rgba(34, 32, 24, 0.65)',
  'rgba(38, 35, 32, 0.65)',
]

interface TopicCardProps {
  topic: string
  memberCount: number
  isActive?: boolean
  index: number
  onClick: () => void
}

export default function TopicCard({ topic, memberCount, isActive, index, onClick }: TopicCardProps) {
  const bg = BG_COLORS[index % 4]
  const bgHover = BG_HOVER[index % 4]

  let countLabel: string
  if (memberCount >= 10) {
    countLabel = 'room forming'
  } else if (memberCount === 0) {
    countLabel = 'waiting...'
  } else {
    countLabel = `${memberCount} in room`
  }

  return (
    <button
      onClick={onClick}
      style={{
        width: '140px',
        height: '180px',
        minWidth: '140px',
        background: bg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(255,255,255,0.07)',
        borderTop: '0.5px solid rgba(255,255,255,0.11)',
        borderLeft: isActive ? '2px solid #3a3833' : '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 150ms ease',
        flexShrink: 0,
        scrollSnapAlign: 'start',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = bgHover }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = bg }}
    >
      <span style={{ fontSize: '15px', fontFamily: 'Georgia, serif', color: '#e4ddd0', display: 'block', marginBottom: '6px', lineHeight: 1.3 }}>
        {topic}
      </span>
      <span style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', color: '#4a4843' }}>
        {countLabel}
      </span>
    </button>
  )
}
