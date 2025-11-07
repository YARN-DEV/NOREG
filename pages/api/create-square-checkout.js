import { SquareApi } from 'squareup'

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
    const client = new SquareApi({
      accessToken: squareAccessToken,
      environment: squareEnvironment === 'production' ? 'production' : 'sandbox'
    })

    // Create line items for Square (amounts in cents)
    const orderLineItems = items.map(item => ({
      name: item.title,
      quantity: item.quantity.toString(),
      itemType: 'ITEM_VARIATION',
      metadata: {
        book_id: item.id.toString(),
        author: item.author
      },
      basePriceMoney: {
        amount: Math.round(item.price * 100), // Convert to cents
        currency: 'USD'
      }
    }))

    // Add tax as separate line item if applicable
    if (tax > 0) {
      orderLineItems.push({
        name: 'Tax',
        quantity: '1',
        itemType: 'ITEM_VARIATION',
        basePriceMoney: {
          amount: Math.round(tax * 100),
          currency: 'USD'
        }
      })
    }

    // Create checkout request
    const checkoutRequest = {
      idempotencyKey: require('crypto').randomUUID(),
      order: {
        locationId: squareLocationId,
        lineItems: orderLineItems
      },
      merchantSupportEmail: customerInfo.email || 'support@yourstore.com',
      prePopulateBuyerEmail: customerInfo.email || '',
      redirectUrl: `${req.headers.origin}/success`,
      note: `Order for ${customerInfo.firstName} ${customerInfo.lastName}`
    }

    console.log('Creating Square checkout:', JSON.stringify(checkoutRequest, null, 2))

    // Create checkout session
    const { result, statusCode } = await client.checkoutApi.createCheckout(
      squareLocationId,
      checkoutRequest
    )

    if (statusCode === 200 && result.checkout) {
      res.status(200).json({ 
        url: result.checkout.checkoutPageUrl,
        checkoutId: result.checkout.id 
      })
    } else {
      console.error('Square checkout creation failed:', result)
      res.status(500).json({ 
        error: 'Failed to create Square checkout',
        details: result.errors || 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Square checkout error:', error)
    
    let errorMessage = 'Failed to create Square checkout'
    if (error.message) {
      errorMessage = `Square error: ${error.message}`
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message
    })
  }
}