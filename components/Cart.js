import Layout from './Layout'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeItem, clearCart, isLoaded } = useCart()
  const [loading, setLoading] = useState(false)

  const total = items.reduce((s, i) => s + i.price * (i.quantity || 1), 0)

  if (!isLoaded) {
    return (
      <Layout>
        <h1>Your Cart</h1>
        <p>Loading cart...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1>Your Cart</h1>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.map(i => (
        <div key={i.id} className="cart-row">
          <img src={i.image} alt={i.title} />
          <div>
            <h3>{i.title}</h3>
            <p>Qty: {i.quantity}</p>
            <p>${(i.price * i.quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(i.id)}>Remove</button>
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div className="checkout">
          <p><strong>Total: ${total.toFixed(2)}</strong></p>
          <div className="checkout-buttons">
            <button onClick={() => window.location.href = '/checkout'} className="btn-primary">
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className="btn-secondary">Clear Cart</button>
          </div>
        </div>
      )}

    </Layout>
  )
}
