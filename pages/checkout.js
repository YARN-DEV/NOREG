import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function CheckoutPage() {
  const { items, clearCart, isLoaded } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('stripe') // 'stripe', 'square'
  const [squarePayments, setSquarePayments] = useState(null)
  const [card, setCard] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: ''
  })
  const router = useRouter()

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  useEffect(() => {
    // Only redirect if cart is loaded and actually empty
    if (isLoaded && items.length === 0) {
      console.log('Cart is loaded and empty, redirecting to cart page')
      router.push('/cart')
    }
  }, [items, router, isLoaded])

  // Initialize Square Web Payments SDK when embedded payment is selected
  useEffect(() => {
    if (paymentMethod === 'square-embedded' && typeof window !== 'undefined') {
      initializeSquarePayments()
    }
  }, [paymentMethod])

  const initializeSquarePayments = async () => {
    try {
      if (!window.Square) {
        console.error('Square Web Payments SDK not loaded')
        return
      }

      const payments = window.Square.payments(process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID, process.env.SQUARE_LOCATION_ID)
      setSquarePayments(payments)

      const cardOptions = {
        style: {
          input: {
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial'
          }
        }
      }

      const cardElement = await payments.card(cardOptions)
      await cardElement.attach('#card-container')
      setCard(cardElement)

      // Set up card button click handler
      const cardButton = document.getElementById('card-button')
      if (cardButton) {
        cardButton.onclick = handleSquareCardPayment
      }

    } catch (error) {
      console.error('Failed to initialize Square payments:', error)
    }
  }

  const handleSquareCardPayment = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    if (!card) {
      alert('Payment form not ready. Please try again.')
      return
    }

    setLoading(true)

    try {
      const tokenResult = await card.tokenize()
      
      if (tokenResult.status === 'OK') {
        // Process payment with token
        const response = await fetch('/api/square-web-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentToken: tokenResult.token,
            items,
            customerInfo,
            total
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          // Payment successful, redirect to success page
          clearCart()
          router.push(`/success?payment_id=${result.paymentId}`)
        } else {
          throw new Error(result.error || 'Payment failed')
        }
      } else {
        throw new Error(tokenResult.errors?.[0]?.detail || 'Failed to process card')
      }
    } catch (error) {
      console.error('Square card payment error:', error)
      alert(`Payment failed: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const required = ['email', 'firstName', 'lastName']
    return required.every(field => customerInfo[field].trim() !== '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      const orderData = {
        items,
        customerInfo,
        subtotal,
        tax,
        total
      }

      let apiEndpoint = '/api/create-checkout-session' // Default to Stripe
      
      if (paymentMethod === 'square-hosted') {
        apiEndpoint = '/api/create-square-checkout'
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const session = await response.json()

      if (response.ok && session.url) {
        // Redirect to payment page (Stripe or Square)
        window.location.href = session.url
      } else {
        throw new Error(session.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Checkout failed: ${error.message}. Please try again or contact support.`)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while cart is being loaded from localStorage
  if (!isLoaded) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading checkout...</p>
        </div>
      </Layout>
    )
  }

  // If cart is loaded and empty, this will be handled by useEffect redirect
  if (isLoaded && items.length === 0) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Your cart is empty. Redirecting...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
      </Head>
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            {items.map(item => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.title} className="item-image" />
                <div className="item-details">
                  <h4>{item.title}</h4>
                  <p>by {item.author}</p>
                  <p>Qty: {item.quantity} × ${item.price}</p>
                </div>
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            
            <div className="order-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="total-line final-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="customer-form">
            <h2>Customer Information</h2>
            
            {/* Payment Method Selection */}
            <div className="payment-method-selection">
              <h3>Choose Payment Method</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Stripe (Credit Card)</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="square-hosted"
                    checked={paymentMethod === 'square-hosted'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Square (Hosted Checkout)</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="square-embedded"
                    checked={paymentMethod === 'square-embedded'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Square (Credit Card - Embedded)</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={customerInfo.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={customerInfo.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={customerInfo.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={customerInfo.country}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="checkout-actions">
                <button 
                  type="button" 
                  onClick={() => router.push('/cart')}
                  className="btn-secondary"
                >
                  Back to Cart
                </button>
                <button 
                  type="submit" 
                  disabled={loading || paymentMethod === 'square-embedded'}
                  className="btn-primary"
                  style={{ display: paymentMethod === 'square-embedded' ? 'none' : 'block' }}
                >
                  {loading ? 'Processing...' : 
                   paymentMethod === 'square-hosted' ? `Pay with Square $${total.toFixed(2)}` :
                   `Pay with Stripe $${total.toFixed(2)}`}
                </button>
              </div>
              
              {/* Square Web Payments SDK Embedded Form */}
              {paymentMethod === 'square-embedded' && (
                <div className="square-embedded-payment">
                  <h3>Pay with Credit Card</h3>
                  <div id="card-container"></div>
                  <button 
                    type="button"
                    id="card-button"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}