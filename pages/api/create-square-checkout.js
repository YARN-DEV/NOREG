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

    // Use Square's simpler checkout API
    const baseUrl = squareEnvironment === 'production' 
      ? 'https://connect.squareup.com' 
      : 'https://connect.squareupsandbox.com'

    // Create direct checkout with items
    const checkoutData = {
      idempotency_key: require('crypto').randomUUID(),
      ask_for_shipping_address: false,
      merchant_support_email: customerInfo.email || 'support@yourstore.com',
      pre_populated_data: {
        buyer_email: customerInfo.email || '',
        buyer_phone_number: customerInfo.phone || ''
      },
      redirect_url: `${req.headers.origin}/success`,
      order: {
        location_id: squareLocationId,
        line_items: items.map(item => ({
          name: item.title,
          quantity: item.quantity.toString(),
          base_price_money: {
            amount: Math.round(item.price * 100),
            currency: 'USD'
          }
        }))
      }
    }

    const response = await fetch(`${baseUrl}/v2/locations/${squareLocationId}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify(checkoutData)
    })

    const result = await response.json()

    if (response.ok && result.checkout) {
      res.status(200).json({ 
        url: result.checkout.checkout_page_url
      })
    } else {
      res.status(500).json({ 
        error: 'Square checkout failed'
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