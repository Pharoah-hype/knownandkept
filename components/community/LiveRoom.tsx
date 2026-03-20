'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import MessageBubble from './MessageBubble'
import ExitConfirm from './ExitConfirm'
import RoomInput from './RoomInput'

interface Message {
  id: string
  handle: string
  content: string
  created_at: string
  distress_flagged?: boolean
  user_id: string
}

interface LiveRoomProps {
  topic: string
  groupId: string
  memberCount: number
  userHandle: string
  userId: string
  onExit: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function LiveRoom({ topic, groupId, memberCount, userHandle, userId, onExit }: LiveRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [hasScrolledUp, setHasScrolledUp] = useState(false)
  const [showNewMessagePill, setShowNewMessagePill] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const init = async () => {
      const { data } = await supabase
        .from('group_posts')
        .select('*, users(handle)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })

      if (data) {
        const mapped: Message[] = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          handle: (row.users as { handle: string } | null)?.handle ?? 'anonymous',
          content: row.content as string,
          created_at: row.created_at as string,
          distress_flagged: row.distress_flagged as boolean | undefined,
          user_id: row.user_id as string,
        }))
        setMessages(mapped)
        setTimeout(scrollToBottom, 50)
      }

      channel = supabase
        .channel(`posts-${groupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'group_posts',
            filter: `group_id=eq.${groupId}`,
          },
          async (payload) => {
            const row = payload.new as Record<string, unknown>
            let handle = 'anonymous'
            const { data: userData } = await supabase
              .from('users')
              .select('handle')
              .eq('id', row.user_id)
              .single()
            if (userData) handle = userData.handle

            const newMsg: Message = {
              id: row.id as string,
              handle,
              content: row.content as string,
              created_at: row.created_at as string,
              distress_flagged: row.distress_flagged as boolean | undefined,
              user_id: row.user_id as string,
            }

            setMessages(prev => [...prev, newMsg])

            setHasScrolledUp(prev => {
              if (prev) {
                setShowNewMessagePill(true)
              } else {
                setTimeout(scrollToBottom, 50)
              }
              return prev
            })
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [groupId, supabase, scrollToBottom])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60
    setHasScrolledUp(!isAtBottom)
    if (isAtBottom) setShowNewMessagePill(false)
  }

  const handleSend = async (content: string) => {
    await fetch('/api/groups/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: groupId, content }),
    })
  }

  const handleHeaderExitClick = () => {
    if (showExitConfirm) {
      onExit()
    } else {
      setShowExitConfirm(true)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(22, 22, 20, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(22, 22, 20, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleHeaderExitClick}
          style={{
            fontSize: '12px',
            fontFamily: 'system-ui, sans-serif',
            color: '#4a4843',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 150ms ease',
            padding: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9a9389' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4a4843' }}
        >
          ← exit
        </button>

        <span style={{ fontSize: '14px', fontFamily: 'Georgia, serif', color: '#e4ddd0' }}>
          {topic}
        </span>

        <span style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', color: '#4a4843' }}>
          {memberCount} here
        </span>
      </div>

      {/* Exit confirm inline */}
      {showExitConfirm && (
        <ExitConfirm
          onStay={() => setShowExitConfirm(false)}
          onLeave={onExit}
        />
      )}

      {/* Messages scroll area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px 22px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <p style={{ fontSize: '14px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9a9389', margin: 0 }}>
              you&apos;re the first one here.
            </p>
            <p style={{ fontSize: '14px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6b6660', margin: 0 }}>
              others are on their way.
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              handle={msg.handle}
              content={msg.content}
              timestamp={formatTime(msg.created_at)}
              isOwn={msg.user_id === userId}
              distressFlagged={msg.distress_flagged}
            />
          ))
        )}
      </div>

      {/* New message pill */}
      {showNewMessagePill && (
        <button
          onClick={() => {
            scrollToBottom()
            setShowNewMessagePill(false)
          }}
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(37, 36, 32, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: '50px',
            padding: '6px 14px',
            fontSize: '11px',
            fontFamily: 'system-ui, sans-serif',
            color: '#9a9389',
            cursor: 'pointer',
            zIndex: 60,
          }}
        >
          New message ↓
        </button>
      )}

      {/* Input */}
      <RoomInput onSend={handleSend} />

      <style>{`
        @keyframes message-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .message-in {
          animation: message-in 150ms ease forwards;
        }
      `}</style>
    </div>
  )
}
