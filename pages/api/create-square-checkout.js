export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
  const squareLocationId = process.env.SQUARE_LOCATION_ID
  const squareEnvironment = process.env.SQUARE_ENVIRONMENT || 'sandbox'

  if (!squareAccessToken || !squareLocationId) {
    return res.status(500).json({ 
      error: 'Square configuration missing' 
    })
  }

  try {
    const { items, customerInfo, total } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' })
    }

    // Use Square's Payment Links API (newer and more reliable)
    const baseUrl = squareEnvironment === 'production' 
      ? 'https://connect.squareup.com' 
      : 'https://connect.squareupsandbox.com'

    const paymentLinkData = {
      idempotency_key: require('crypto').randomUUID(),
      description: `NOREG eBook Store - ${items.map(item => item.title).join(', ')}`,
      quick_pay: {
        pricing_type: 'FIXED_PRICING',
        price_money: {
          amount: Math.round(total * 100), // Convert to cents
          currency: 'USD'
        },
        location_id: squareLocationId
      },
      checkout_options: {
        redirect_url: `${req.headers.origin}/success`,
        ask_for_shipping_address: false
      }
    }

    const response = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify(paymentLinkData)
    })

    const result = await response.json()

    if (response.ok && result.payment_link) {
      res.status(200).json({ 
        url: result.payment_link.url
      })
    } else {
      console.error('Square API Error:', result)
      res.status(500).json({ 
        error: 'Square payment link creation failed',
        details: result.errors || result.message || 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Square payment error:', error)
    res.status(500).json({ 
      error: `Square error: ${error.message}`
    })
  }
}