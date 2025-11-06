import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart')
      if (raw) {
        const parsedItems = JSON.parse(raw)
        setItems(parsedItems)
        console.log('Loaded cart from localStorage:', parsedItems)
      }
    } catch (e) { 
      console.error('Error loading cart:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      try { 
        localStorage.setItem('cart', JSON.stringify(items))
        console.log('Saved cart to localStorage:', items)
      } catch (e) {
        console.error('Error saving cart:', e)
      }
    }
  }, [items, isLoaded])

  function addItem(book) {
    setItems(prev => {
      const found = prev.find(p => p.id === book.id)
      if (found) return prev.map(p => p.id === book.id ? { ...p, quantity: p.quantity + 1 } : p)
      return [...prev, { ...book, quantity: 1 }]
    })
  }

  function removeItem(id) {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  function clearCart() { setItems([]) }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isLoaded }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
