import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const [user, setUser] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const router = useRouter();
  const { plan } = router.query;

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Set plan details based on query parameter
    if (plan) {
      const plans = {
        'monthly-premium': {
          name: 'Premium Monthly',
          price: '$50',
          interval: 'month'
        },
        'yearly-premium': {
          name: 'Premium Yearly',
          price: '$500',
          interval: 'year'
        }
      };
      setPlanDetails(plans[plan]);
    }
  }, [plan]);

  return (
    <Layout>
      <Head>
        <title>Subscription Successful - NOREG eBook Store</title>
      </Head>
      
      <div className="container">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h1>Welcome to Premium!</h1>
          
          {user && (
            <p className="welcome-message">
              Congratulations {user.firstName}! Your subscription is now active.
            </p>
          )}
          
          {planDetails && (
            <div className="subscription-details">
              <h2>Subscription Details</h2>
              <div className="detail-row">
                <span>Plan:</span>
                <span>{planDetails.name}</span>
              </div>
              <div className="detail-row">
                <span>Amount:</span>
                <span>{planDetails.price} per {planDetails.interval}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className="active">Active</span>
              </div>
            </div>
          )}
          
          <div className="benefits">
            <h3>Your Premium Benefits Include:</h3>
            <ul>
              <li>✅ Unlimited ebook downloads</li>
              <li>✅ Exclusive premium content</li>
              <li>✅ Early access to new releases</li>
              <li>✅ Member-only discounts</li>
              <li>✅ Priority customer support</li>
            </ul>
          </div>
          
          <div className="next-steps">
            <h3>What's Next?</h3>
            <p>Start exploring your premium benefits right away!</p>
            
            <div className="action-buttons">
              <Link href="/" className="btn btn-primary">
                Browse Premium eBooks
              </Link>
              <Link href="/account" className="btn btn-secondary">
                Manage Subscription
              </Link>
            </div>
          </div>
          
          <div className="support-info">
            <p><strong>Need Help?</strong></p>
            <p>Contact our support team at support@noreg.com or visit our help center.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .success-content {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          text-align: center;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        h1 {
          color: #28a745;
          margin-bottom: 1rem;
        }

        .welcome-message {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .subscription-details {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 2rem 0;
          text-align: left;
        }

        .subscription-details h2 {
          text-align: center;
          margin-bottom: 1rem;
          color: #333;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .active {
          color: #28a745;
          font-weight: bold;
        }

        .benefits {
          margin: 2rem 0;
        }

        .benefits h3 {
          color: #333;
          margin-bottom: 1rem;
        }

        .benefits ul {
          list-style: none;
          padding: 0;
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }

        .benefits li {
          padding: 0.5rem 0;
          color: #555;
        }

        .next-steps {
          margin: 2rem 0;
        }

        .next-steps h3 {
          color: #333;
          margin-bottom: 1rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          padding: 1rem 2rem;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          transition: background 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .support-info {
          margin-top: 3rem;
          padding: 2rem;
          background: #e3f2fd;
          border-radius: 8px;
        }

        .support-info p {
          margin: 0.5rem 0;
          color: #666;
        }

        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </Layout>
  );
}