import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CheckoutPage() {
  const { items, clearCart, isLoaded } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const router = useRouter();

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push('/cart');
    }
  }, [items, router, isLoaded]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/create-square-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerInfo,
          subtotal,
          tax,
          total
        })
      });

      const session = await response.json();

      if (response.ok && session.url) {
        window.location.href = session.url;
      } else {
        throw new Error(session.error || 'Failed to create checkout');
      }
    } catch (error) {
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <Layout><div>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <Head>
        <title>Checkout - NOREG eBook Store</title>
      </Head>
      
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            {items.map(item => (
              <div key={item.id} className="order-item">
                <span>{item.title} x {item.quantity}</span>
                <span></span>
              </div>
            ))}
            <div className="total">
              <strong>Total: </strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Customer Information</h2>
            
            <div className="payment-method">
              <h3>Payment Method: Square Payment</h3>
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={customerInfo.email}
              onChange={handleInputChange}
              required
            />
            
            <input
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={customerInfo.firstName}
              onChange={handleInputChange}
              required
            />
            
            <input
              type="text"
              name="lastName"
              placeholder="Last Name *"
              value={customerInfo.lastName}
              onChange={handleInputChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : `Pay $${total.toFixed(2)} with Square`}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .checkout-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin: 2rem 0;
        }

        .order-summary {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .total {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #ddd;
          font-size: 1.2rem;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .payment-method {
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        button {
          padding: 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          cursor: pointer;
        }

        button:hover {
          background: #0056b3;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .checkout-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
