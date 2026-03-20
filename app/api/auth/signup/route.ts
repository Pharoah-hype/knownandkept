import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const { email, password, handle } = await request.json()

    if (!email || !password || !handle) {
      return NextResponse.json(
        { error: 'Email, password, and handle are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
    }

    // Insert into public.users with handle
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({ id: userId, email, handle })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Insert empty profile row
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ user_id: userId, assessment_complete: false })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Create Stripe customer
    const customer = await getStripe().customers.create({
      email,
      metadata: { supabase_id: userId },
    })

    // Update users with stripe_customer_id
    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
