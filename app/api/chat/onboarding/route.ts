import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic } from '@/lib/ai/anthropic'
import type Anthropic from '@anthropic-ai/sdk'
import { getOnboardingPrompt } from '@/lib/ai/individualPrompt'
import { embedMessage } from '@/lib/ai/embedMessage'
import { detectCrisis, CRISIS_RESPONSE_HIGH } from '@/lib/ai/detectCrisis'

const writeProfileTool: Anthropic.Tool = {
  name: 'write_profile',
  description:
    'Write the assessed personality and attachment profile for this user after the onboarding conversation is complete.',
  input_schema: {
    type: 'object' as const,
    properties: {
      attachment_style: { type: 'string' },
      conflict_style: { type: 'string' },
      emotional_triggers: { type: 'array', items: { type: 'string' } },
      love_language_primary: { type: 'string' },
      love_language_secondary: { type: 'string' },
      communication_pattern: { type: 'string' },
      core_wounds: { type: 'array', items: { type: 'string' } },
      defense_mechanisms: { type: 'array', items: { type: 'string' } },
      relationship_goals: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
    },
    required: ['attachment_style', 'conflict_style', 'summary'],
  },
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, history } = await request.json()

    // Check if assessment already complete
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('assessment_complete')
      .eq('user_id', user.id)
      .single()

    if (profile?.assessment_complete) {
      return NextResponse.json({ redirect: '/home' })
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

    // Build messages array for Claude
    const systemPrompt = getOnboardingPrompt()
    const messages: Anthropic.MessageParam[] = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      tools: [writeProfileTool],
    })

    // Check for tool use (profile write)
    const toolBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    )

    if (toolBlock && toolBlock.name === 'write_profile') {
      const profileData = toolBlock.input as Record<string, unknown>

      await supabaseAdmin
        .from('profiles')
        .update({
          ...profileData,
          assessment_complete: true,
        })
        .eq('user_id', user.id)

      // Embed the full conversation
      const fullConversation = messages
        .map((m) => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`)
        .join('\n')
      await embedMessage(fullConversation, user.id, 'onboarding')
    }

    // Extract text response
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )

    return NextResponse.json({
      message: textBlock?.text || '',
      assessment_complete: !!toolBlock,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
