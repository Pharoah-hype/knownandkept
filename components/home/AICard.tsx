'use client'

import Link from 'next/link'
import { useState } from 'react'

interface AICardProps {
  lastMessage: string | null
}

export default function AICard({ lastMessage }: AICardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href="/chat"
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: hovered ? 'rgba(37, 36, 32, 0.65)' : 'rgba(30, 29, 26, 0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,0.07)',
          borderTop: '0.5px solid rgba(255,255,255,0.11)',
          borderRadius: '16px',
          padding: '20px',
          transition: 'background 150ms ease',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Top label */}
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            color: '#4a4843',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 400,
            margin: 0,
          }}
        >
          your space
        </p>

        {/* AI message preview */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#9a9389',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {lastMessage || 'Begin here.'}
        </p>

        {/* Divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '0.5px solid #2a2926',
            margin: 0,
          }}
        />

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '12px',
              color: '#6b6660',
              fontWeight: 400,
            }}
          >
            continue
          </span>
          <div
            className="ai-presence"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#4a4843',
            }}
          />
        </div>
      </div>
    </Link>
  )
}
