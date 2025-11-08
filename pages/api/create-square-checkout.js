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

    // Use the simpler payment link approach without creating order first
    const paymentLinkRequest = {
      idempotencyKey: require('crypto').randomUUID(),
      quickPay: {
        name: `eBook Store Purchase`,
        priceMoney: {
          amount: Math.round(total * 100), // Convert to cents
          currency: 'USD'
        },
        locationId: squareLocationId
      },
      checkoutOptions: {
        askForShippingAddress: false,
        allowTipping: false,
        redirectUrl: `${req.headers.origin}/success`,
        merchantSupportEmail: customerInfo.email || 'support@yourstore.com'
      },
      prePopulatedData: {
        buyerEmail: customerInfo.email || '',
        buyerPhoneNumber: customerInfo.phone || ''
      }
    }

    console.log('Creating Square payment link:', JSON.stringify(paymentLinkRequest, null, 2))

    // Create payment link directly
    const { result } = await client.checkoutApi.createPaymentLink(paymentLinkRequest)

    if (result && result.paymentLink) {
      res.status(200).json({ 
        url: result.paymentLink.url,
        paymentLinkId: result.paymentLink.id 
      })
    } else {
      console.error('Square payment link creation failed:', result)
      res.status(500).json({ 
        error: 'Failed to create Square payment link',
        details: result.errors || 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Square checkout error:', error)
    
    let errorMessage = 'Failed to create Square checkout'
    if (error.message) {
      errorMessage = `Square error: ${error.message}`
    }
    
    // Check if it's an API structure issue
    if (error.message && error.message.includes('Cannot read properties of undefined')) {
      errorMessage = 'Square API client not properly initialized. Please check your Square credentials.'
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      stack: error.stack
    })
  }
}