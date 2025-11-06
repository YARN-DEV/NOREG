import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { session_id } = req.query

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) {
    return res.status(500).json({ error: 'Stripe secret key not configured' })
  }

  const stripe = new Stripe(stripeSecret)

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    
    // Only return essential data for security
    const sessionData = {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email,
      created: session.created,
      metadata: session.metadata
    }

    res.status(200).json(sessionData)
  } catch (error) {
    console.error('Error retrieving session:', error)
    res.status(500).json({ error: 'Failed to retrieve session data' })
  }
}