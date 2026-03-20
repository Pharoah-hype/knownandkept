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

    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Find an existing group with this topic and available space
    const { data: existingGroup } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('topic', topic)
      .lt('member_count', 10)
      .limit(1)
      .single()

    let groupId: string

    if (existingGroup) {
      groupId = existingGroup.id
    } else {
      // Create a new group
      const { data: newGroup, error: createError } = await supabaseAdmin
        .from('groups')
        .insert({ topic, member_count: 0 })
        .select()
        .single()

      if (createError || !newGroup) {
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
      }

      groupId = newGroup.id
    }

    // Insert group_members row (trigger handles count increment + split)
    const { error: joinError } = await supabaseAdmin
      .from('group_members')
      .insert({ group_id: groupId, user_id: user.id })

    if (joinError) {
      return NextResponse.json({ error: joinError.message }, { status: 500 })
    }

    return NextResponse.json({ group_id: groupId })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
