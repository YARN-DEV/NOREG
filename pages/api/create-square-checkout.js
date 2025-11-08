const squareConnect = require('square')
const { SquareClient, SquareEnvironment } = squareConnect

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
  const squareLocationId = process.env.SQUARE_LOCATION_ID
  const squareEnvironment = process.env.SQUARE_ENVIRONMENT || 'sandbox'

  // Debug logging
  console.log('Environment Variables Debug:')
  console.log('SQUARE_ACCESS_TOKEN:', squareAccessToken ? `${squareAccessToken.substring(0, 10)}...` : 'MISSING')
  console.log('SQUARE_LOCATION_ID:', squareLocationId || 'MISSING')
  console.log('SQUARE_ENVIRONMENT:', squareEnvironment)

  if (!squareAccessToken || !squareLocationId) {
    return res.status(500).json({ 
      error: 'Square configuration missing. Please add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID to your environment variables.',
      debug: {
        hasAccessToken: !!squareAccessToken,
        hasLocationId: !!squareLocationId,
        environment: squareEnvironment
      }
    })
  }

  try {
    const { items, customerInfo, subtotal, tax, total } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' })
    }

    // Initialize Square client with proper environment
    console.log('Initializing Square client with environment:', squareEnvironment)
    console.log('SquareClient available:', !!SquareClient)
    console.log('SquareEnvironment available:', !!SquareEnvironment)
    console.log('SquareEnvironment value:', SquareEnvironment)
    
    // Use SquareEnvironment enum values since they're working now
    const client = new SquareClient({
      accessToken: squareAccessToken,
      environment: squareEnvironment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox
    })

    // Debug: Check if client APIs are available
    console.log('Square client created. Available APIs:')
    console.log('All client properties:', Object.keys(client))
    console.log('Client prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)))
    console.log('checkoutApi available:', !!client.checkoutApi)
    console.log('paymentsApi available:', !!client.paymentsApi)
    console.log('ordersApi available:', !!client.ordersApi)
    
    // Try to access APIs through different methods
    const apis = ['checkoutApi', 'paymentsApi', 'ordersApi']
    apis.forEach(apiName => {
      if (client[apiName]) {
        console.log(`${apiName} methods:`, Object.getOwnPropertyNames(client[apiName]))
      }
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

    // Try to access the checkout API using the correct method
    try {
      const { checkoutApi } = client;
      
      if (checkoutApi && checkoutApi.createPaymentLink) {
        console.log('Using checkoutApi.createPaymentLink')
        const response = await checkoutApi.createPaymentLink(paymentLinkRequest)
        
        if (response.result && response.result.paymentLink) {
          res.status(200).json({ 
            url: response.result.paymentLink.url,
            paymentLinkId: response.result.paymentLink.id 
          })
        } else {
          console.error('Square payment link creation failed:', response)
          res.status(500).json({ 
            error: 'Failed to create Square payment link',
            details: response.result?.errors || 'Unknown error'
          })
        }
      } else {
        console.error('checkoutApi or createPaymentLink method not available')
        res.status(500).json({ 
          error: 'Square Checkout API not available. The Square SDK may not be properly configured.',
          availableApis: Object.keys(client),
          checkoutApiAvailable: !!checkoutApi,
          createPaymentLinkAvailable: !!checkoutApi?.createPaymentLink
        })
      }
    } catch (apiError) {
      console.error('Error accessing Square API:', apiError)
      res.status(500).json({ 
        error: 'Error accessing Square API',
        details: apiError.message,
        availableApis: Object.keys(client)
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