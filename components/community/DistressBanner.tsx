'use client'

export default function DistressBanner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1, height: '0.5px', background: '#2a2926' }} />
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: '#4a4843',
          whiteSpace: 'nowrap',
        }}
      >
        if you&apos;re struggling, 988 is always there
      </span>
      <div style={{ flex: 1, height: '0.5px', background: '#2a2926' }} />
    </div>
  )
}
