import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'

export default function SuccessPage() {
  const router = useRouter()
  const { sessionId } = router.query
  const { clearCart } = useCart()
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Always clear the cart on success page
    clearCart()
    setLoading(false)
  }, [clearCart])

  const fetchSessionData = async (sessionId) => {
    try {
      const response = await fetch(`/api/checkout-session?session_id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      }
    } catch (error) {
      console.error('Error fetching session data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your purchase. Your ebooks will be available for download shortly.</p>
          
          {loading && <p>Loading order details...</p>}
          
          {sessionData && (
            <div className="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> {sessionData.id}</p>
              <p><strong>Amount Paid:</strong> ${(sessionData.amount_total / 100).toFixed(2)}</p>
              <p><strong>Email:</strong> {sessionData.customer_email}</p>
            </div>
          )}

          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>Check your email for a receipt and download links</li>
              <li>Download links will be valid for 30 days</li>
              <li>You can re-download your purchases anytime from your account</li>
            </ul>
          </div>

          <div className="success-actions">
            <button 
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => router.push('/account/downloads')}
              className="btn-secondary"
            >
              View Downloads
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}