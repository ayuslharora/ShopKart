import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/useCart'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart, isPending, quantityInCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [savingWishlist, setSavingWishlist] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
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

  useEffect(() => {
    if (!user) return
    let mounted = true

    axiosInstance
      .get('/wishlist')
      .then(({ data }) => mounted && setWishlisted(data.wishlist.some((p) => p._id === id)))
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [id, user])

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setSavingWishlist(true)
    setMessage('')
    try {
      const { data } = await axiosInstance.patch(`/wishlist/${id}/toggle`)
      setWishlisted(data.saved)
    } catch {
      setMessage('Could not update your wishlist. Try again.')
    } finally {
      setSavingWishlist(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setMessage('')
    try {
      await addToCart(id)
      setMessage('Added to your cart.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add to cart. Try again.')
    }
  }

  // Orders are only created through checkout (so they get paid for), so Buy now
  // puts the product in the cart if it isn't there yet and goes straight to checkout.
  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setMessage('')
    if (quantityInCart(id) === 0) {
      setBuyingNow(true)
      try {
        await addToCart(id)
      } catch (error) {
        setMessage(error.response?.data?.message || 'Could not add to cart. Try again.')
        setBuyingNow(false)
        return
      }
    }
    navigate('/checkout')
  }

  if (loading) return <Loading />

  if (notFound) {
    return (
      <div className="flex min-h-svh flex-col">
        <Navbar variant="light" search />
        <main className="wrap flex flex-1 items-center justify-center py-20">
          <p className="text-[16px] text-ink-soft">This product doesn't exist or was removed.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search />

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

          {quantityInCart(id) > 0 && (
            <p className="mt-2 text-[13.5px] font-semibold text-leaf">{quantityInCart(id)} in your cart</p>
          )}

          <div className="mt-7 flex flex-wrap gap-3.5">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isPending(id) || product.stock === 0 || quantityInCart(id) >= product.stock}
              className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isPending(id) ? 'Adding...' : quantityInCart(id) > 0 ? 'Add Another' : 'Add to Cart'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={buyingNow || product.stock === 0}
              className="btn btn-primary disabled:opacity-60"
            >
              {buyingNow ? 'Adding to cart…' : 'Buy now'}
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={savingWishlist}
              className="rounded-lg border-[1.5px] border-line-strong bg-cream px-4.5 py-3 text-[14.5px] font-bold text-ink disabled:opacity-60"
            >
              {savingWishlist ? '⏳ Saving...' : wishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
