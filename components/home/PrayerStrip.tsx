'use client'

import Link from 'next/link'
import { useState } from 'react'

interface PrayerStripProps {
  count: number
}

export default function PrayerStrip({ count }: PrayerStripProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href="/prayer"
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: 'rgba(30, 29, 26, 0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,0.07)',
          borderTop: '0.5px solid rgba(255,255,255,0.11)',
          borderRadius: '12px',
          padding: '14px 20px',
          transition: 'background 150ms ease',
          cursor: 'pointer',
        }}
      >
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            color: hovered ? '#9a9389' : '#6b6660',
            fontWeight: 400,
            margin: 0,
            transition: 'color 150ms ease',
          }}
        >
          prayer board · {count} request{count !== 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  )
}
