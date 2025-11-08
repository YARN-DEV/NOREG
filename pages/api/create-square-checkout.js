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

    // Create order first, then payment link
    const orderRequest = {
      idempotencyKey: require('crypto').randomUUID(),
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

    // Create order
    const { result: orderResult } = await client.ordersApi.createOrder(orderRequest)
    
    if (!orderResult || !orderResult.order) {
      throw new Error('Failed to create order')
    }

    // Create payment link
    const paymentLinkRequest = {
      idempotencyKey: require('crypto').randomUUID(),
      quickPay: {
        name: 'eBook Store Purchase',
        priceMoney: {
          amount: Math.round(total * 100),
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

    const { result } = await client.checkoutApi.createPaymentLink(paymentLinkRequest)

    if (result && result.paymentLink) {
      res.status(200).json({ 
        url: result.paymentLink.url
      })
    } else {
      res.status(500).json({ 
        error: 'Failed to create Square payment link',
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