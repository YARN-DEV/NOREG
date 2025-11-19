import { useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Store user session (simplified)
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        }));
        
        // Redirect to subscription plans
        router.push('/subscriptions');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Register - NOREG eBook Store</title>
      </Head>
      
      <div className="container">
        <div className="register-form">
          <h1>Create Your Account</h1>
          <p>Join NOREG to access premium ebook subscriptions</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters) *"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="register-btn">
              {loading ? 'Creating Account...' : 'Create Account & Choose Plan'}
            </button>
          </form>
          
          <p className="login-link">
            Already have an account? <a href="/login">Sign in here</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .register-form {
          max-width: 500px;
          margin: 2rem auto;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .register-form h1 {
          text-align: center;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .register-form p {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: #007bff;
        }

        .register-btn {
          width: 100%;
          padding: 1rem;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .register-btn:hover {
          background: #218838;
        }

        .register-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .login-link {
          text-align: center;
          margin: 0;
        }

        .login-link a {
          color: #007bff;
          text-decoration: none;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}