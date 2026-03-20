'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import GreetingBlock from '@/components/home/GreetingBlock'
import AICard from '@/components/home/AICard'
import QuickCard from '@/components/home/QuickCard'
import PrayerStrip from '@/components/home/PrayerStrip'

// SVG Icons

function CommunityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="9" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="13" cy="9" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}

function PrayerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 3 L10 17 M7 6 C7 6 5 7 5 9.5 C5 12 7 13 10 13 C13 13 15 12 15 9.5 C15 7 13 6 13 6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function CoupleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6.5" cy="10" r="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="13.5" cy="10" r="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="10" y1="8.5" x2="10" y2="11.5" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  )
}

interface HomeData {
  handle: string
  lastMessage: string | null
  reflection: string | null
  isCoupled: boolean
  partnerHandle: string | null
  prayerCount: number
  groupsCount: number
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>({
    handle: '',
    lastMessage: null,
    reflection: null,
    isCoupled: false,
    partnerHandle: null,
    prayerCount: 0,
    groupsCount: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const uid = user.id

    // Fetch all in parallel
    const [
      userResult,
      lastAIResult,
      coupleResult,
      prayerResult,
    ] = await Promise.all([
      supabase.from('users').select('handle').eq('id', uid).single(),
      supabase
        .from('conversations')
        .select('content')
        .eq('role', 'assistant')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('couples')
        .select('partner_a_id, partner_b_id')
        .or(`partner_a_id.eq.${uid},partner_b_id.eq.${uid}`)
        .eq('invite_accepted', true)
        .maybeSingle(),
      supabase
        .from('prayer_requests')
        .select('id', { count: 'exact', head: true })
        .eq('answered', false),
    ])

    const handle = userResult.data?.handle ?? ''
    const lastMessage = lastAIResult.data?.content ?? null
    const reflection = lastMessage

    const coupleRow = coupleResult.data
    let isCoupled = false
    let partnerHandle: string | null = null

    if (coupleRow) {
      isCoupled = true
      const partnerId =
        coupleRow.partner_a_id === uid ? coupleRow.partner_b_id : coupleRow.partner_a_id

      const { data: partnerData } = await supabase
        .from('users')
        .select('handle')
        .eq('id', partnerId)
        .single()

      partnerHandle = partnerData?.handle ?? null
    }

    const prayerCount = prayerResult.count ?? 0

    setData({
      handle,
      lastMessage,
      reflection,
      isCoupled,
      partnerHandle,
      prayerCount,
      groupsCount: 0, // groups count query omitted as schema may vary
    })
  }

  const coupleMetaLabel = data.partnerHandle
    ? `you & ${data.partnerHandle}`
    : 'your shared space'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '22px',
        gap: '16px',
        minHeight: '100%',
      }}
    >
      <GreetingBlock handle={data.handle} reflection={data.reflection} />

      <AICard lastMessage={data.lastMessage} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        <QuickCard
          icon={<CommunityIcon />}
          label="Community"
          meta="anonymous groups of 10"
          href="/community"
        />
        <QuickCard
          icon={<PrayerIcon />}
          label="Prayer"
          meta="carry each other"
          href="/prayer"
        />
        {data.isCoupled && (
          <QuickCard
            icon={<CoupleIcon />}
            label="Couple"
            meta={coupleMetaLabel}
            href="/couple"
            fullWidth
          />
        )}
      </div>

      <PrayerStrip count={data.prayerCount} />
    </div>
  )
}
