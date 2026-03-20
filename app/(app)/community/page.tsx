'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopicSlider from '@/components/community/TopicSlider'
import QueueScreen from '@/components/community/QueueScreen'
import LiveRoom from '@/components/community/LiveRoom'

type CommunityState = 'selector' | 'queue' | 'room'

interface TopicData {
  topic: string
  memberCount: number
}

export default function CommunityPage() {
  const [state, setState] = useState<CommunityState>('selector')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [topics, setTopics] = useState<TopicData[]>([])
  const [userId, setUserId] = useState<string>('')
  const [userHandle, setUserHandle] = useState<string>('anonymous')

  const supabase = createClient()
  const queueChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const queueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Fetch handle
      const { data: profile } = await supabase
        .from('users')
        .select('handle')
        .eq('id', user.id)
        .single()
      if (profile?.handle) setUserHandle(profile.handle)

      // Fetch group counts
      const { data: groups } = await supabase
        .from('groups')
        .select('topic, member_count')
        .lt('member_count', 10)
        .order('member_count', { ascending: false })

      if (groups) {
        // Build map: topic -> highest member_count
        const topicMap = new Map<string, number>()
        for (const g of groups) {
          const existing = topicMap.get(g.topic) ?? 0
          if (g.member_count > existing) {
            topicMap.set(g.topic, g.member_count)
          }
        }
        const topicsArr: TopicData[] = Array.from(topicMap.entries()).map(([topic, count]) => ({
          topic,
          memberCount: count,
        }))
        setTopics(topicsArr)
      }
    }

    init()
  }, [supabase])

  const handleSelectTopic = async (topic: string) => {
    setSelectedTopic(topic)
    setState('queue')

    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const data = await res.json()
      const id = data.groupId ?? data.id ?? data.group_id
      const count = data.memberCount ?? data.member_count ?? 1

      setGroupId(id)
      setMemberCount(count)

      if (count >= 2) {
        setState('room')
        return
      }

      // Subscribe to realtime updates on this group
      const channel = supabase
        .channel(`group-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'groups',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            const newCount = (payload.new as { member_count: number }).member_count
            setMemberCount(newCount)
            if (newCount >= 2) {
              setState('room')
              if (queueChannelRef.current) {
                supabase.removeChannel(queueChannelRef.current)
                queueChannelRef.current = null
              }
              if (queueTimeoutRef.current) {
                clearTimeout(queueTimeoutRef.current)
                queueTimeoutRef.current = null
              }
            }
          }
        )
        .subscribe()

      queueChannelRef.current = channel

      // 30s fallback: move to room even if still solo
      queueTimeoutRef.current = setTimeout(() => {
        setState(prev => {
          if (prev === 'queue') return 'room'
          return prev
        })
        if (queueChannelRef.current) {
          supabase.removeChannel(queueChannelRef.current)
          queueChannelRef.current = null
        }
      }, 30000)
    } catch (err) {
      console.error('Failed to join group:', err)
      setState('selector')
      setSelectedTopic(null)
    }
  }

  const handleLeaveQueue = async () => {
    // Cleanup realtime
    if (queueChannelRef.current) {
      supabase.removeChannel(queueChannelRef.current)
      queueChannelRef.current = null
    }
    if (queueTimeoutRef.current) {
      clearTimeout(queueTimeoutRef.current)
      queueTimeoutRef.current = null
    }

    // Best-effort leave API call
    try {
      if (groupId) {
        await fetch('/api/groups/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group_id: groupId }),
        })
      }
    } catch {
      // Route may not exist — ignore
    }

    setState('selector')
    setSelectedTopic(null)
    setGroupId(null)
    setMemberCount(0)
  }

  const handleExitRoom = () => {
    setState('selector')
    setGroupId(null)
    setSelectedTopic(null)
    setMemberCount(0)
  }

  if (state === 'room' && selectedTopic && groupId) {
    return (
      <LiveRoom
        topic={selectedTopic}
        groupId={groupId}
        memberCount={memberCount}
        userHandle={userHandle}
        userId={userId}
        onExit={handleExitRoom}
      />
    )
  }

  if (state === 'queue' && selectedTopic) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: '100dvh',
          background: '#161614',
          position: 'relative',
        }}
      >
        <QueueScreen
          topic={selectedTopic}
          memberCount={memberCount}
          onLeave={handleLeaveQueue}
        />
      </div>
    )
  }

  // selector
  return (
    <div style={{ flex: 1, paddingTop: '60px' }}>
      <div style={{ paddingLeft: '22px', paddingRight: '22px', marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '20px',
            fontFamily: 'Georgia, serif',
            color: '#e4ddd0',
            margin: '0 0 8px 0',
          }}
        >
          community
        </h1>
        <p
          style={{
            fontSize: '13px',
            fontFamily: 'system-ui, sans-serif',
            color: '#6b6660',
            margin: 0,
          }}
        >
          pick what&apos;s on your mind
        </p>
      </div>

      <TopicSlider topics={topics} onSelect={handleSelectTopic} />
    </div>
  )
}
