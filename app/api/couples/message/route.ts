import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic } from '@/lib/ai/anthropic'
import type Anthropic from '@anthropic-ai/sdk'
import { getCouplesPrompt } from '@/lib/ai/couplesPrompt'
import { detectCrisis, CRISIS_RESPONSE_HIGH } from '@/lib/ai/detectCrisis'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { couple_id, message, history } = await request.json()

    // Load couple record and verify user is a partner
    const { data: couple, error: coupleError } = await supabaseAdmin
      .from('couples')
      .select('*')
      .eq('id', couple_id)
      .single()

    if (coupleError || !couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
    }

    if (couple.partner_a_id !== user.id && couple.partner_b_id !== user.id) {
      return NextResponse.json({ error: 'Not a member of this couple' }, { status: 403 })
    }

    // Crisis detection
    const crisisCheck = detectCrisis(message)
    if (crisisCheck.crisis && crisisCheck.severity === 'high') {
      await supabaseAdmin
        .from('profiles')
        .update({ crisis_flag: true })
        .eq('user_id', user.id)

      return NextResponse.json({ message: CRISIS_RESPONSE_HIGH, crisis: true })
    }

    // Load both profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('user_id', [couple.partner_a_id, couple.partner_b_id])

    const profileA = profiles?.find((p: any) => p.user_id === couple.partner_a_id)
    const profileB = profiles?.find((p: any) => p.user_id === couple.partner_b_id)

    // Load disclosure state
    const { data: disclosures } = await supabaseAdmin
      .from('profile_disclosures')
      .select('*')
      .eq('couple_id', couple_id)

    // Load intersection model
    const { data: intersection } = await supabaseAdmin
      .from('couple_intersection')
      .select('*')
      .eq('couple_id', couple_id)
      .single()

    // Count couple_sessions for session count
    const { count: sessionCount } = await supabaseAdmin
      .from('couple_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('couple_id', couple_id)

    // Build couples prompt
    const systemPrompt = getCouplesPrompt(
      profileA || {},
      profileB || {},
      disclosures?.[0] || {},
      intersection || { friction_patterns: [], compounding_wounds: [], hidden_alignments: [] },
      sessionCount ?? 0
    )

    const messages: Anthropic.MessageParam[] = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )

    const aiMessage = textBlock?.text || ''

    // Insert into couple_sessions
    await supabaseAdmin.from('couple_sessions').insert({
      couple_id,
      user_id: user.id,
      user_message: message,
      ai_message: aiMessage,
    })

    return NextResponse.json({ message: aiMessage })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
