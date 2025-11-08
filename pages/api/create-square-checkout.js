const SquareConnect = require('squareup')

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
    const defaultClient = SquareConnect.ApiClient.instance
    const oauth2 = defaultClient.authentications['oauth2']
    oauth2.accessToken = squareAccessToken
    
    if (squareEnvironment === 'sandbox') {
      defaultClient.basePath = 'https://connect.squareupsandbox.com'
    }

    const checkoutApi = new SquareConnect.CheckoutApi()

    // Create line items for Square (amounts in cents)
    const orderLineItems = items.map(item => ({
      name: item.title,
      quantity: item.quantity.toString(),
      item_type: 'ITEM_VARIATION',
      base_price_money: {
        amount: Math.round(item.price * 100), // Convert to cents
        currency: 'USD'
      }
    }))

    // Add tax as separate line item if applicable
    if (tax > 0) {
      orderLineItems.push({
        name: 'Tax',
        quantity: '1',
        item_type: 'ITEM_VARIATION',
        base_price_money: {
          amount: Math.round(tax * 100),
          currency: 'USD'
        }
      })
    }

    // Create checkout request
    const checkoutRequest = {
      idempotency_key: require('crypto').randomUUID(),
      order: {
        location_id: squareLocationId,
        line_items: orderLineItems
      },
      ask_for_shipping_address: false,
      merchant_support_email: customerInfo.email || 'support@yourstore.com',
      pre_populate_buyer_email: customerInfo.email || '',
      redirect_url: `${req.headers.origin}/success`,
      note: `Order for ${customerInfo.firstName} ${customerInfo.lastName}`
    }

    console.log('Creating Square checkout:', JSON.stringify(checkoutRequest, null, 2))

    // Create checkout session
    const result = await new Promise((resolve, reject) => {
      checkoutApi.createCheckout(squareLocationId, checkoutRequest, (error, data, response) => {
        if (error) {
          reject(error)
        } else {
          resolve({ data, response })
        }
      })
    })

    if (result.data && result.data.checkout) {
      res.status(200).json({ 
        url: result.data.checkout.checkout_page_url,
        checkoutId: result.data.checkout.id 
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