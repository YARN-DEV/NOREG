// All payments now redirect to Gumroad
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, customerInfo, total } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' })
    }

    // All payments go to Gumroad
    const gumroadUrl = 'https://anthonyfrmtexas.gumroad.com/l/NOREG?_gl=1*18q39e2*_ga*MTUzODA5NjAxMy4xNzU3ODAzMzcw*_ga_6LJN6D94N6*czE3NjM1MjM5MTAkbzMkZzEkdDE3NjM1MjQ5NzEkajYwJGwwJGgw'
    
    console.log('Redirecting to Gumroad for checkout:', { 
      items: items.length,
      total: total,
      customer: customerInfo?.email || 'anonymous'
    })

    res.status(200).json({ 
      url: gumroadUrl
    })

  } catch (error) {
    console.error('Gumroad redirect error:', error)
    res.status(500).json({ 
      error: 'Payment redirect failed'
    })
  }
}