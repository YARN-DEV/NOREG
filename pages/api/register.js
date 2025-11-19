export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, password } = req.body;

    // Basic validation
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // In a real app, you would:
    // 1. Hash the password
    // 2. Store user in database
    // 3. Check for existing users
    // For now, we'll simulate successful registration

    console.log('New user registered:', { email, firstName, lastName });

    // Simulate user creation success
    res.status(200).json({ 
      success: true,
      message: 'Account created successfully',
      user: {
        email,
        firstName,
        lastName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
}