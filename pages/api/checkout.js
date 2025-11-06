import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) {
    return res.status(500).json({ error: 'Stripe secret key not configured' })
  }

  const stripe = new Stripe(stripeSecret)

  try {
    const { items } = req.body
    // For now this is a placeholder: convert items to Stripe line_items and create a Checkout Session
    // Implement real line items and success/cancel URLs when integrating
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(i => ({ price_data: {
        currency: 'usd',
        product_data: { name: i.title },
        unit_amount: Math.round(i.price * 100)
      }, quantity: i.quantity })),
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=1`,
      cancel_url: `${req.headers.origin}/?canceled=1`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Stripe checkout creation failed' })
  }
}
