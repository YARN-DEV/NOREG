import Head from 'next/head'
import Link from 'next/link'
import { useCart } from '../context/CartContext'

export default function Layout({ children }) {
  const { items } = useCart()
  const count = items.reduce((s, i) => s + (i.quantity || 0), 0)

  return (
    <div>
      <Head>
        <title>eBook Store</title>
      </Head>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand">eBook Store</Link>
          <nav>
            <Link href="/subscriptions">Premium Plans</Link>
            <Link href="/register">Register</Link>
            <Link href="/cart">Cart ({count})</Link>
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>

      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} eBook Store</div>
      </footer>
    </div>
  )
}
