import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import books from '../../data/books.json'
import ProductCard from '../../components/ProductCard'

export default function ProductPage() {
  const router = useRouter()
  const { id } = router.query
  const book = books.find((b) => String(b.id) === String(id))

  if (!book) return (
    <Layout>
      <p>Book not found.</p>
    </Layout>
  )

  return (
    <Layout>
      <h1>{book.title}</h1>
      <div style={{maxWidth:600}}>
        <img src={book.image} alt={book.title} style={{width:'100%',height:'auto'}}/>
        <p>{book.description}</p>
        <p><strong>Price: ${book.price}</strong></p>
        <ProductCard book={book} showDetails={false} />
      </div>
    </Layout>
  )
}
