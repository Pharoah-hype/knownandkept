'use client'

import Link from 'next/link'
import { useState } from 'react'

interface QuickCardProps {
  icon: React.ReactNode
  label: string
  meta: string
  href: string
  fullWidth?: boolean
}

export default function QuickCard({ icon, label, meta, href, fullWidth }: QuickCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        display: 'block',
        gridColumn: fullWidth ? '1 / -1' : undefined,
      }}
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
          borderRadius: '12px',
          padding: '20px',
          transition: 'background 150ms ease',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '100%',
        }}
      >
        {/* Icon */}
        <div
          style={{
            color: '#6b6660',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Label */}
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            color: '#e4ddd0',
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {label}
        </p>

        {/* Meta */}
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#4a4843',
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {meta}
        </p>
      </div>
    </Link>
  )
}
