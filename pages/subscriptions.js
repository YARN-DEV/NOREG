import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Head from 'next/head';
import subscriptions from '../data/subscriptions.json';

export default function SubscriptionsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/register');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          user: user,
          plan: plan
        })
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        alert('Subscription setup failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Subscription failed: ' + error.message);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Choose Your Plan - NOREG eBook Store</title>
      </Head>
      
      <div className="container">
        <div className="subscription-header">
          <h1>Welcome, {user.firstName}!</h1>
          <p>Choose your premium subscription plan to unlock unlimited access to our ebook library.</p>
        </div>

        <div className="plans-grid">
          {subscriptions.map((plan) => (
            <div key={plan.id} className={`plan-card ${plan.id === 'yearly-premium' ? 'featured' : ''}`}>
              {plan.id === 'yearly-premium' && <div className="best-value">Best Value</div>}
              
              <h2>{plan.name}</h2>
              <div className="price-section">
                <div className="price">
                  ${plan.price}
                  {plan.originalPrice && (
                    <span className="original-price">${plan.originalPrice}</span>
                  )}
                </div>
                <div className="interval">per {plan.interval === 'monthly' ? 'month' : 'year'}</div>
              </div>
              
              <p className="description">{plan.description}</p>
              
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className="subscribe-btn"
              >
                {loading && selectedPlan === plan.id ? 'Redirecting to Gumroad...' : `Subscribe ${plan.interval === 'monthly' ? 'Monthly' : 'Yearly'}`}
              </button>
            </div>
          ))}
        </div>
        
        <div className="guarantee">
          <p>✅ 30-day money-back guarantee</p>
          <p>✅ Cancel anytime</p>
          <p>✅ Secure payment with Gumroad</p>
        </div>
      </div>

      <style jsx>{`
        .subscription-header {
          text-align: center;
          margin: 2rem 0;
        }

        .subscription-header h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .subscription-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 3rem 0;
        }

        .plan-card {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .plan-card.featured {
          border-color: #28a745;
          transform: scale(1.05);
        }

        .best-value {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #28a745;
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .plan-card h2 {
          color: #333;
          margin-bottom: 1rem;
        }

        .price-section {
          margin-bottom: 1.5rem;
        }

        .price {
          font-size: 3rem;
          font-weight: bold;
          color: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .original-price {
          font-size: 1.5rem;
          color: #999;
          text-decoration: line-through;
        }

        .interval {
          color: #666;
          font-size: 1rem;
        }

        .description {
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .features {
          list-style: none;
          padding: 0;
          margin-bottom: 2rem;
        }

        .features li {
          padding: 0.5rem 0;
          color: #555;
          text-align: left;
        }

        .subscribe-btn {
          width: 100%;
          padding: 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .subscribe-btn:hover {
          background: #0056b3;
        }

        .subscribe-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .featured .subscribe-btn {
          background: #28a745;
        }

        .featured .subscribe-btn:hover {
          background: #218838;
        }

        .guarantee {
          text-align: center;
          margin: 3rem 0;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .guarantee p {
          margin: 0.5rem 0;
          color: #28a745;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .plan-card.featured {
            transform: none;
          }
          
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}