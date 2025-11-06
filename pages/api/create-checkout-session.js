import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) {
    return res.status(500).json({ error: 'Stripe secret key not configured. Please add STRIPE_SECRET_KEY to your environment variables.' })
  }

  const stripe = new Stripe(stripeSecret)

  try {
    const { items, customerInfo, subtotal, tax, total } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' })
    }

    // Create line items for Stripe
    const lineItems = items.map(item => {
      // Convert relative image URLs to absolute URLs or use a placeholder
      let imageUrl = item.image
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `${req.headers.origin}${imageUrl}`
      }
      // If image is still not a valid URL, use a placeholder or remove it
      const validImageUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) 
        ? imageUrl 
        : 'https://via.placeholder.com/400x600/0070f3/ffffff?text=eBook'

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            description: `by ${item.author}`,
            // Temporarily remove images to avoid URL validation issues
            // images: [validImageUrl],
            metadata: {
              book_id: item.id.toString(),
              author: item.author
            }
          },
          unit_amount: Math.round(item.price * 100) // Convert to cents
        },
        quantity: item.quantity
      }
    })

    // Add tax as a separate line item if applicable
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            description: 'Sales Tax'
          },
          unit_amount: Math.round(tax * 100)
        },
        quantity: 1
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerInfo.email,
      metadata: {
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_email: customerInfo.email,
        order_total: total.toString(),
        items_count: items.length.toString()
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart?canceled=1`,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: false, // We're calculating tax manually
      }
    })

    res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create checkout session'
    if (error.code === 'url_invalid') {
      errorMessage = 'Invalid product image URL'
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Stripe error: ${error.message}`
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      code: error.code || 'unknown'
    })
  }
}