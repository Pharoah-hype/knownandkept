'use client'

import { useState } from 'react'

interface RoomInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function RoomInput({ onSend, disabled }: RoomInputProps) {
  const [value, setValue] = useState('')

  const hasContent = value.trim().length > 0

  const handleSend = () => {
    if (!hasContent || disabled) return
    onSend(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        background: 'rgba(22, 22, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="say something..."
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          fontFamily: 'Georgia, serif',
          color: '#e4ddd0',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!hasContent || disabled}
        style={{
          fontSize: '13px',
          fontFamily: 'system-ui, sans-serif',
          color: hasContent ? '#6b6660' : '#4a4843',
          background: 'none',
          border: 'none',
          cursor: hasContent ? 'pointer' : 'default',
          transition: 'color 150ms ease',
          padding: '4px 0',
        }}
        onMouseEnter={e => {
          if (hasContent) (e.currentTarget as HTMLButtonElement).style.color = '#d4cdbf'
        }}
        onMouseLeave={e => {
          if (hasContent) (e.currentTarget as HTMLButtonElement).style.color = '#6b6660'
        }}
      >
        send
      </button>

      <style>{`
        input::placeholder { color: #4a4843; }
      `}</style>
    </div>
  )
}
