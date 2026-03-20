import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic } from '@/lib/ai/anthropic'
import type Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { couple_id } = await request.json()

    // Load couple
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

    // Load both profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('user_id', [couple.partner_a_id, couple.partner_b_id])

    const profileA = profiles?.find((p: any) => p.user_id === couple.partner_a_id)
    const profileB = profiles?.find((p: any) => p.user_id === couple.partner_b_id)

    if (!profileA || !profileB) {
      return NextResponse.json(
        { error: 'Both partners must complete their assessments' },
        { status: 400 }
      )
    }

    // Call Claude to compute intersection model
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are a relationship psychology expert. Analyze two partner profiles and produce a JSON intersection model. Return ONLY valid JSON with these fields:
- friction_patterns: array of strings describing likely friction points
- compounding_wounds: array of strings describing how their wounds may compound
- hidden_alignments: array of strings describing unexpected compatibility points
- narcissistic_impact: object with { identifier_confidence: number 0-1, patterns: string[] }

Be specific and clinical. Reference attachment styles, conflict styles, and core wounds from both profiles.`,
      messages: [
        {
          role: 'user',
          content: `Partner A profile:\n${JSON.stringify(profileA, null, 2)}\n\nPartner B profile:\n${JSON.stringify(profileB, null, 2)}`,
        },
      ],
    })

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )

    const rawText = textBlock?.text || '{}'
    // Extract JSON from potential markdown code blocks
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText]
    const intersectionData = JSON.parse(jsonMatch[1]!.trim())

    // Upsert into couple_intersection
    const { data: intersection, error: upsertError } = await supabaseAdmin
      .from('couple_intersection')
      .upsert(
        {
          couple_id,
          friction_patterns: intersectionData.friction_patterns,
          compounding_wounds: intersectionData.compounding_wounds,
          hidden_alignments: intersectionData.hidden_alignments,
          narcissistic_impact: intersectionData.narcissistic_impact,
          narcissistic_identifier_confidence:
            intersectionData.narcissistic_impact?.identifier_confidence ?? 0,
        },
        { onConflict: 'couple_id' }
      )
      .select()
      .single()

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    // If narcissistic_identifier_confidence > 0.6, flag the identified partner
    const confidence =
      intersectionData.narcissistic_impact?.identifier_confidence ?? 0
    if (confidence > 0.6) {
      // Flag on both profiles — the couples prompt will handle disclosure carefully
      await supabaseAdmin
        .from('profiles')
        .update({ couples_confirmed: true })
        .in('user_id', [couple.partner_a_id, couple.partner_b_id])
    }

    return NextResponse.json({ intersection })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
