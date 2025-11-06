import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import CartDebug from '../components/CartDebug'
import books from '../data/books.json'
import { useState } from 'react'

export default function Home() {
  const [items] = useState(books)

  return (
    <Layout>
      <CartDebug />
      <h1>Featured eBooks</h1>
      <div className="grid">
        {items.map((b) => (
          <ProductCard key={b.id} book={b} />
        ))}
      </div>
    </Layout>
  )
}
