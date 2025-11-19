import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import books from '../data/books.json'
import { useState } from 'react'

export default function Home() {
  const [items] = useState(books)

  return (
    <Layout>
      <div className="hero-section">
        <h1>Premium eBook Library</h1>
        <p>Unlimited access to thousands of premium ebooks</p>
        <div className="cta-buttons">
          <a href="/register" className="btn-primary">Start Free Trial</a>
          <a href="/subscriptions" className="btn-secondary">View Plans</a>
        </div>
      </div>
      
      <h2>Featured eBooks</h2>
      <div className="grid">
        {items.map((b) => (
          <ProductCard key={b.id} book={b} />
        ))}
      </div>

      <style jsx>{`
        .hero-section {
          text-align: center;
          padding: 3rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          margin-bottom: 3rem;
        }

        .hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .hero-section p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          display: inline-block;
          padding: 1rem 2rem;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #28a745;
          color: white;
        }

        .btn-primary:hover {
          background: #218838;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: #667eea;
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2rem;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-primary, .btn-secondary {
            width: 200px;
          }
        }
      `}</style>
    </Layout>
  )
}
