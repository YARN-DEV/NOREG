// All subscriptions now redirect to Gumroad
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, user, plan } = req.body;

    if (!planId || !user || !plan) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // All subscriptions go to Gumroad
    const gumroadUrl = 'https://anthonyfrmtexas.gumroad.com/l/NOREG?_gl=1*18q39e2*_ga*MTUzODA5NjAxMy4xNzU3ODAzMzcw*_ga_6LJN6D94N6*czE3NjM1MjM5MTAkbzMkZzEkdDE3NjM1MjQ5NzEkajYwJGwwJGgw';
    
    console.log('Subscription redirect to Gumroad:', {
      user: user.email,
      plan: plan.name,
      amount: plan.price
    });

    res.status(200).json({ 
      url: gumroadUrl,
      subscriptionId: `gumroad-${planId}-${Date.now()}`
    });

  } catch (error) {
    console.error('Subscription redirect error:', error);
    res.status(500).json({ 
      error: `Subscription redirect failed: ${error.message}`
    });
  }
}