import { SquareClient, SquareEnvironment } from 'square'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
  const squareLocationId = process.env.SQUARE_LOCATION_ID
  const squareEnvironment = process.env.SQUARE_ENVIRONMENT || 'sandbox'

  if (!squareAccessToken || !squareLocationId) {
    return res.status(500).json({ 
      error: 'Square configuration missing. Please add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID to your environment variables.'
    })
  }

  try {
    const { items, customerInfo, subtotal, tax, total } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' })
    }

    // Initialize Square client
    const client = new SquareClient({
      accessToken: squareAccessToken,
      environment: squareEnvironment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox
    })

    // Create checkout request
    const checkoutRequest = {
      idempotencyKey: require('crypto').randomUUID(),
      askForShippingAddress: false,
      merchantSupportEmail: customerInfo.email || 'support@yourstore.com',
      prePopulatedData: {
        buyerEmail: customerInfo.email || '',
        buyerPhoneNumber: customerInfo.phone || ''
      },
      redirectUrl: `${req.headers.origin}/success`,
      order: {
        locationId: squareLocationId,
        lineItems: items.map(item => ({
          name: item.title,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: Math.round(item.price * 100),
            currency: 'USD'
          }
        }))
      }
    }

    // Use the correct Square API call
    const { result } = await client.checkoutApi.createCheckout(squareLocationId, checkoutRequest)

    if (result && result.checkout) {
      res.status(200).json({ 
        url: result.checkout.checkoutPageUrl
      })
    } else {
      res.status(500).json({ 
        error: 'Failed to create Square checkout',
        details: result?.errors || 'Unknown error'
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