import { useCart } from '../context/CartContext'

export default function CartDebug() {
  const { items, isLoaded } = useCart()
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '200px'
    }}>
      <strong>Cart Debug:</strong>
      <br />
      Loaded: {isLoaded ? 'Yes' : 'No'}
      <br />
      Items: {items.length}
      <br />
      {items.map(item => (
        <div key={item.id}>
          {item.title} (Qty: {item.quantity})
        </div>
      ))}
    </div>
  )
}