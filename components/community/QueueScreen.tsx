'use client'

interface QueueScreenProps {
  topic: string
  memberCount: number
  onLeave: () => void
}

export default function QueueScreen({ topic, memberCount, onLeave }: QueueScreenProps) {
  const filledDots = Math.min(memberCount, 3)
  const emptyDots = 3 - filledDots

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        paddingTop: '60px',
        paddingLeft: '22px',
        paddingRight: '22px',
        minHeight: '100%',
      }}
    >
      <button
        onClick={onLeave}
        style={{
          position: 'absolute',
          top: '20px',
          left: '22px',
          fontSize: '20px',
          color: '#4a4843',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          lineHeight: 1,
          padding: '4px',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9a9389' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4a4843' }}
        aria-label="Go back"
      >
        ←
      </button>

      <h2
        style={{
          fontSize: '22px',
          fontFamily: 'Georgia, serif',
          color: '#e4ddd0',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {topic}
      </h2>

      <p
        style={{
          fontSize: '13px',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: '#6b6660',
          textAlign: 'center',
          margin: 0,
        }}
      >
        finding your room
      </p>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
        {Array.from({ length: filledDots }).map((_, i) => (
          <div
            key={`filled-${i}`}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#3a3833',
            }}
          />
        ))}
        {Array.from({ length: emptyDots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="dot-waiting"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2a2926',
            }}
          />
        ))}
      </div>

      <p
        style={{
          fontSize: '20px',
          fontFamily: 'Georgia, serif',
          color: '#e4ddd0',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {memberCount} of 10
      </p>

      <p
        style={{
          fontSize: '12px',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: '#4a4843',
          textAlign: 'center',
          margin: 0,
        }}
      >
        this usually takes under a minute.
      </p>

      <div
        style={{
          width: '60px',
          height: '0.5px',
          background: '#2a2926',
          margin: '8px auto',
        }}
      />

      <button
        onClick={onLeave}
        style={{
          fontSize: '13px',
          fontFamily: 'system-ui, sans-serif',
          color: '#6b6660',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9a9389' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6b6660' }}
      >
        leave queue
      </button>
    </div>
  )
}
