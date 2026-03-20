'use client'

interface GreetingBlockProps {
  handle: string
  reflection: string | null
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'good morning'
  if (hour < 17) return 'good afternoon'
  return 'good evening'
}

export default function GreetingBlock({ handle, reflection }: GreetingBlockProps) {
  const reflectionText = reflection
    ? reflection.slice(0, 80) + (reflection.length > 80 ? '...' : '')
    : 'your space is ready.'

  return (
    <div>
      <p
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '11px',
          color: '#6b6660',
          letterSpacing: '0.05em',
          marginBottom: '4px',
          fontWeight: 400,
        }}
      >
        {getGreeting()}
      </p>
      <h1
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          color: '#e4ddd0',
          fontWeight: 400,
          marginBottom: '6px',
          lineHeight: 1.2,
        }}
      >
        {handle || '\u00a0'}
      </h1>
      <p
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: '#9a9389',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.5,
        }}
      >
        {reflectionText}
      </p>
    </div>
  )
}
