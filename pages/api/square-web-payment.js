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
      error: 'Square configuration missing' 
    })
  }

  try {
    const { paymentToken, items, customerInfo, total } = req.body

    if (!paymentToken) {
      return res.status(400).json({ error: 'Payment token is required' })
    }

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

    const paymentsApi = new SquareConnect.PaymentsApi()

    // Create payment request
    const paymentRequest = {
      source_id: paymentToken,
      idempotency_key: require('crypto').randomUUID(),
      amount_money: {
        amount: Math.round(total * 100), // Convert to cents
        currency: 'USD'
      },
      location_id: squareLocationId,
      note: `Ebook purchase: ${items.map(item => item.title).join(', ')}`,
      buyer_email_address: customerInfo.email
    }

    console.log('Processing Square Web Payment:', JSON.stringify(paymentRequest, null, 2))

    // Process payment
    const result = await new Promise((resolve, reject) => {
      paymentsApi.createPayment(paymentRequest, (error, data, response) => {
        if (error) {
          reject(error)
        } else {
          resolve({ data, response })
        }
      })
    })

    if (result.data && result.data.payment) {
      // Payment successful
      res.status(200).json({
        success: true,
        paymentId: result.data.payment.id,
        status: result.data.payment.status,
        receiptUrl: result.data.payment.receipt_url,
        totalMoney: result.data.payment.total_money
      })
    } else {
      console.error('Square payment failed:', result)
      res.status(400).json({
        error: 'Payment failed',
        details: result.errors || 'Unknown payment error'
      })
    }

  } catch (error) {
    console.error('Square Web Payment error:', error)
    
    let errorMessage = 'Payment processing failed'
    if (error.message) {
      errorMessage = `Square error: ${error.message}`
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message
    })
  }
}