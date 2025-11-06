# NOREG Ebook Store (Next.js)

This is a minimal starter Next.js app to sell ebooks.

Features included:
- Product catalog (local JSON data)
- Shopping cart with context and localStorage
- Placeholder API route for Stripe checkout

Quick start (PowerShell):

```powershell
# install dependencies
cd "C:\Users\Hp\Documents\GitHub\NOREG"
npm install

# run dev server
npm run dev
```

Environment variables:
- Create a `.env.local` file with `STRIPE_SECRET_KEY=sk_test_...` for checkout integration.

Next steps (recommended):
- Add authentication
- Add admin interface for uploading ebooks and managing orders
- Implement secure file delivery after purchase (signed URLs)
- Integrate Stripe Checkout or Payment Intents
