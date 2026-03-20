'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Home', href: '/home', icon: HomeIcon },
  { label: 'Chat', href: '/chat', icon: ChatIcon },
  { label: 'Community', href: '/community', icon: CommunityIcon },
  { label: 'Prayer', href: '/prayer', icon: PrayerIcon },
  { label: 'Profile', href: '/profile', icon: ProfileIcon },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(22, 22, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: active ? '#d4cdbf' : '#4a4843',
              transition: 'color 150ms ease',
              textDecoration: 'none',
            }}
          >
            <tab.icon />
            <span
              style={{
                fontSize: 10,
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
            {active && (
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#d4cdbf',
                  display: 'block',
                }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Triangle roof */}
      <polyline points="2,9 10,2 18,9" />
      {/* House body rectangle */}
      <rect x="4" y="9" width="12" height="9" />
      {/* Door */}
      <rect x="7.5" y="13" width="5" height="5" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Rounded speech bubble rect */}
      <rect x="2" y="2" width="16" height="12" rx="3" />
      {/* Small triangle bottom-left */}
      <polyline points="4,14 2,18 7,14" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Left circle */}
      <circle cx="7" cy="10" r="5" />
      {/* Right circle overlapping */}
      <circle cx="13" cy="10" r="5" />
    </svg>
  )
}

function PrayerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Circle */}
      <circle cx="10" cy="10" r="7" />
      {/* Vertical bar of cross */}
      <line x1="10" y1="5" x2="10" y2="15" />
      {/* Horizontal bar of cross */}
      <line x1="6" y1="9" x2="14" y2="9" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Circle head */}
      <circle cx="10" cy="7" r="3.5" />
      {/* Arc shoulders */}
      <path d="M3,18 C3,13.5 17,13.5 17,18" />
    </svg>
  )
}
