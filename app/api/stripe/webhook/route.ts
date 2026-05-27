import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id || session.client_reference_id

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan: 'pro',
            status: subscription.status,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          }, { onConflict: 'user_id' })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          await supabase.from('subscriptions').update({
            status: subscription.status,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          }).eq('user_id', sub.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase.from('subscriptions')
          .update({ status: 'canceled', plan: 'free' })
          .eq('stripe_customer_id', customerId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
