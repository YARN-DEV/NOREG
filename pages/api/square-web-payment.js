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
    const client = new SquareClient({
      accessToken: squareAccessToken,
      environment: squareEnvironment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox
    })

    const { paymentsApi } = client

    // Create payment request
    const paymentRequest = {
      sourceId: paymentToken,
      idempotencyKey: require('crypto').randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(total * 100)), // Convert to cents
        currency: 'USD'
      },
      locationId: squareLocationId,
      note: `Ebook purchase: ${items.map(item => item.title).join(', ')}`,
      buyerEmailAddress: customerInfo.email
    }

    console.log('Processing Square Web Payment:', JSON.stringify(paymentRequest, null, 2))

    // Process payment
    const { result } = await paymentsApi.createPayment(paymentRequest)

    if (result && result.payment) {
      // Payment successful
      res.status(200).json({
        success: true,
        paymentId: result.payment.id,
        status: result.payment.status,
        receiptUrl: result.payment.receiptUrl,
        totalMoney: result.payment.totalMoney
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