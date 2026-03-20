import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Get subscription to determine tier
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id

        await supabaseAdmin
          .from('users')
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_tier: mapPriceToTier(priceId),
            subscription_status: 'active',
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        await supabaseAdmin
          .from('users')
          .update({
            subscription_tier: mapPriceToTier(priceId),
            subscription_status: subscription.status,
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabaseAdmin
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabaseAdmin
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Webhook error' },
      { status: 400 }
    )
  }
}

function mapPriceToTier(priceId: string): string {
  const tierMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_INDIVIDUAL!]: 'individual',
    [process.env.STRIPE_PRICE_COUPLES!]: 'couples',
    [process.env.STRIPE_PRICE_FAMILY!]: 'family',
  }

  return tierMap[priceId] || 'free'
}
