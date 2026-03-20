import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/ai/anthropic'
import { buildUserContext } from '@/lib/ai/buildUserContext'
import { getOngoingPrompt } from '@/lib/ai/individualPrompt'
import { embedMessage } from '@/lib/ai/embedMessage'
import { detectCrisis, CRISIS_RESPONSE_HIGH } from '@/lib/ai/detectCrisis'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, history } = await request.json()

    // Check subscription tier and message limits
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('subscription_tier, messages_used')
      .eq('id', user.id)
      .single()

    if (userData?.subscription_tier === 'free' && (userData?.messages_used ?? 0) >= 20) {
      return NextResponse.json({ gated: true })
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

    // Build context and prompt
    const { profile, similarHistory } = await buildUserContext(user.id, message)
    const systemPrompt = getOngoingPrompt(profile || {}, similarHistory)

    const messages: { role: string; content: string }[] = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    const response = await chatCompletion({
      system: systemPrompt,
      messages,
      maxTokens: 1024,
    })

    const aiMessage = response.text || ''

    // Embed the exchange pair
    await embedMessage(
      `User: ${message}\nAssistant: ${aiMessage}`,
      user.id,
      'ongoing'
    )

    // Increment messages_used
    await supabaseAdmin
      .from('users')
      .update({ messages_used: (userData?.messages_used ?? 0) + 1 })
      .eq('id', user.id)

    return NextResponse.json({ message: aiMessage })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
