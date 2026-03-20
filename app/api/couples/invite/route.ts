import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(_request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check assessment_complete
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('assessment_complete')
      .eq('user_id', user.id)
      .single()

    if (!profile?.assessment_complete) {
      return NextResponse.json(
        { error: 'Complete your assessment before inviting a partner' },
        { status: 403 }
      )
    }

    const inviteToken = crypto.randomUUID()

    const { data: couple, error: coupleError } = await supabaseAdmin
      .from('couples')
      .insert({
        partner_a_id: user.id,
        invite_token: inviteToken,
        invite_accepted: false,
      })
      .select()
      .single()

    if (coupleError) {
      return NextResponse.json({ error: coupleError.message }, { status: 500 })
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/couples/accept?token=${inviteToken}`

    return NextResponse.json({ invite_link: inviteLink, couple_id: couple.id })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
