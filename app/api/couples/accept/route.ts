import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Check assessment_complete
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('assessment_complete')
      .eq('user_id', user.id)
      .single()

    if (!profile?.assessment_complete) {
      return NextResponse.json(
        { error: 'Complete your assessment before accepting an invite' },
        { status: 403 }
      )
    }

    // Find couple by invite_token
    const { data: couple, error: findError } = await supabaseAdmin
      .from('couples')
      .select('*')
      .eq('invite_token', token)
      .eq('invite_accepted', false)
      .single()

    if (findError || !couple) {
      return NextResponse.json(
        { error: 'Invalid or expired invite token' },
        { status: 404 }
      )
    }

    if (couple.partner_a_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot accept your own invite' },
        { status: 400 }
      )
    }

    // Update couple with partner B
    const { error: updateError } = await supabaseAdmin
      .from('couples')
      .update({
        partner_b_id: user.id,
        invite_accepted: true,
      })
      .eq('id', couple.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create profile_disclosures for both partners
    await supabaseAdmin.from('profile_disclosures').insert([
      { couple_id: couple.id, user_id: couple.partner_a_id },
      { couple_id: couple.id, user_id: user.id },
    ])

    return NextResponse.json({ couple_id: couple.id })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
