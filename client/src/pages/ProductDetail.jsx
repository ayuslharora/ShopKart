import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchProduct = async () => {
      setLoading(true)
      try {
        const { data } = await axiosInstance.get(`/products/${id}`)
        if (!mounted) return
        setProduct(data)
        setNotFound(false)
      } catch (error) {
        if (!mounted) return
        setNotFound(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProduct()

    return () => {
      mounted = false
    }
  }, [id])

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const { data } = await axiosInstance.post(`/users/wishlist/${id}`)
      setWishlisted(data.saved)
    } catch (error) {
      setMessage('Could not update your wishlist. Try again.')
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setPlacingOrder(true)
    setMessage('')
    try {
      await axiosInstance.post('/orders', { productId: id, quantity: 1 })
      setMessage('Order placed! Check your profile for order history.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not place the order. Try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) return <Loading />

  if (notFound) {
    return (
      <div className="flex min-h-svh flex-col">
        <Navbar variant="light" search cartCount={3} />
        <main className="wrap flex flex-1 items-center justify-center py-20">
          <p className="text-[16px] text-ink-soft">This product doesn't exist or was removed.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search cartCount={3} />

      <main className="wrap grid grid-cols-2 gap-12 py-14 max-[860px]:grid-cols-1">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full rounded-xl object-cover"
          />
        ) : (
          <div className="aspect-square rounded-xl bg-linear-155 from-marigold to-[#e8b34a]" />
        )}

        <div>
          <span className="text-xs font-bold text-ink-soft">{product.category}</span>
          <h1 className="mt-2 text-[30px] leading-tight">{product.name}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-[26px] font-extrabold">₹{product.price}</span>
            {product.stock > 0 ? (
              <span className="text-[13.5px] font-semibold text-leaf">In stock</span>
            ) : (
              <span className="text-[13.5px] font-semibold text-brick">Out of stock</span>
            )}
          </div>

          {product.seller?.shopName && (
            <p className="mt-2 text-[13.5px] text-ink-soft">Sold by {product.seller.shopName}</p>
          )}

          {message && <p className="mt-4 text-[14px] font-medium text-ink">{message}</p>}

          <div className="mt-7 flex gap-3.5">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={placingOrder || product.stock === 0}
              className="btn btn-primary disabled:opacity-60"
            >
              {placingOrder ? 'Placing order…' : 'Buy now'}
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className="rounded-lg border-[1.5px] border-line-strong bg-cream px-4.5 py-3 text-[14.5px] font-bold text-ink"
            >
              {wishlisted ? 'Saved ✓' : 'Save for later'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
