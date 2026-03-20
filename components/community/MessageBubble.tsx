'use client'

import DistressBanner from './DistressBanner'

interface MessageBubbleProps {
  handle: string
  content: string
  timestamp: string
  isOwn: boolean
  distressFlagged?: boolean
}

export default function MessageBubble({ handle, content, timestamp, isOwn, distressFlagged }: MessageBubbleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
          marginLeft: isOwn ? 'auto' : undefined,
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'system-ui, sans-serif',
            color: '#4a4843',
            letterSpacing: '0.08em',
            marginBottom: '4px',
          }}
        >
          {handle}
        </span>

        <p
          className="message-in"
          style={{
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            color: isOwn ? '#d4cdbf' : '#9a9389',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {content}
        </p>

        <span
          style={{
            fontSize: '10px',
            fontFamily: 'system-ui, sans-serif',
            color: '#4a4843',
            alignSelf: 'flex-end',
            marginTop: '2px',
          }}
        >
          {timestamp}
        </span>
      </div>

      {distressFlagged && <DistressBanner />}
    </div>
  )
}
