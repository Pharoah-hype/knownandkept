import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/push/sendNotification'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const { user_id, title, body, url } = await request.json()

    if (!user_id || !title || !body) {
      return NextResponse.json(
        { error: 'user_id, title, and body are required' },
        { status: 400 }
      )
    }

    // Load push subscriptions for the user
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found for user' },
        { status: 404 }
      )
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          { title, body, url }
        )
      )
    )

    // Clean up expired subscriptions (returned false)
    const expiredEndpoints = subscriptions
      .filter((_, i) => {
        const result = results[i]
        return result.status === 'fulfilled' && result.value === false
      })
      .map((sub) => sub.endpoint)

    if (expiredEndpoints.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user_id)
        .in('endpoint', expiredEndpoints)
    }

    return NextResponse.json({ success: true, sent: subscriptions.length })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
