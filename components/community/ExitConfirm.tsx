'use client'

interface ExitConfirmProps {
  onStay: () => void
  onLeave: () => void
}

export default function ExitConfirm({ onStay, onLeave }: ExitConfirmProps) {
  return (
    <div
      style={{
        background: '#1e1d1a',
        borderBottom: '0.5px solid #2a2926',
        padding: '16px 22px',
      }}
    >
      <p style={{ fontSize: '13px', fontFamily: 'system-ui, sans-serif', color: '#9a9389', margin: '0 0 4px 0' }}>
        leaving closes your spot in this room.
      </p>
      <p style={{ fontSize: '13px', fontFamily: 'system-ui, sans-serif', color: '#6b6660', margin: 0 }}>
        you can rejoin a new group from the topic screen.
      </p>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', marginTop: '12px' }}>
        <button
          onClick={onStay}
          style={{
            fontSize: '13px',
            fontFamily: 'system-ui, sans-serif',
            color: '#e4ddd0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          stay
        </button>

        <button
          onClick={onLeave}
          style={{
            fontSize: '13px',
            fontFamily: 'system-ui, sans-serif',
            color: '#6b6660',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9a9389' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6b6660' }}
        >
          leave
        </button>
      </div>
    </div>
  )
}
