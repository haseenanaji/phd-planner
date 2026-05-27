import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      papers: 10,
      literature: 20,
      experiments: 5,
      ai: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 9,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
    limits: {
      papers: Infinity,
      literature: Infinity,
      experiments: Infinity,
      ai: true,
    },
  },
}
