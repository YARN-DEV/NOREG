import Link from 'next/link'
import { useCart } from '../context/CartContext'

export default function ProductCard({ book, showDetails = true }) {
  const { addItem } = useCart()
  
  const handleAddToCart = () => {
    addItem(book)
    console.log('Added to cart:', book)
  }
  
  return (
    <div className="card">
      <img src={book.image} alt={book.title} />
      <h3>{book.title}</h3>
      <p className="author">{book.author}</p>
      <p className="price">${book.price}</p>
      <div className="actions">
        <button onClick={handleAddToCart}>Add to cart</button>
        {showDetails && (
          <Link href={`/product/${book.id}`} className="details">Details</Link>
        )}
      </div>
    </div>
  )
}
