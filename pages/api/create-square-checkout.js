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
    const { items, customerInfo, subtotal, tax, total } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' })
    }

    // Use Square REST API directly
    const baseUrl = squareEnvironment === 'production' 
      ? 'https://connect.squareup.com' 
      : 'https://connect.squareupsandbox.com'

    // Create payment link using REST API
    const paymentLinkData = {
      idempotency_key: require('crypto').randomUUID(),
      quick_pay: {
        name: 'eBook Store Purchase',
        price_money: {
          amount: Math.round(total * 100),
          currency: 'USD'
        },
        location_id: squareLocationId
      },
      checkout_options: {
        ask_for_shipping_address: false,
        allow_tipping: false,
        redirect_url: `${req.headers.origin}/success`,
        merchant_support_email: customerInfo.email || 'support@yourstore.com'
      },
      pre_populated_data: {
        buyer_email: customerInfo.email || '',
        buyer_phone_number: customerInfo.phone || ''
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
        error: 'Failed to create Square payment link',
        details: result.errors || 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Square checkout error:', error)
    res.status(500).json({ 
      error: `Square error: ${error.message}`,
      details: error.message
    })
  }
}