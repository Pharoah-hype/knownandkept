import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { detectCrisis } from '@/lib/ai/detectCrisis'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { group_id, content } = await request.json()

    if (!group_id || !content) {
      return NextResponse.json(
        { error: 'group_id and content are required' },
        { status: 400 }
      )
    }

    // Verify membership
    const { data: membership } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', group_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    // Crisis detection
    const crisisCheck = detectCrisis(content)

    const { data: post, error: postError } = await supabaseAdmin
      .from('group_posts')
      .insert({
        group_id,
        user_id: user.id,
        content,
        distress_flagged: crisisCheck.crisis,
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
