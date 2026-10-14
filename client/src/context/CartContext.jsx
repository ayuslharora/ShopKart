import { useCallback, useEffect, useMemo, useState } from 'react'
import { axiosInstance } from '../axiosCalls/axios.js'
import { useAuth } from './AuthContext.jsx'
import { CartContext } from './useCart.js'

// The one shared copy of the cart for the whole app. Navbar, product cards and
// the cart page all read from here instead of fetching the cart themselves.
export const CartProvider = ({ children }) => {
    const { user } = useAuth()
    const userId = user?._id ?? null

    // ownerId records whose cart `items` belongs to, so after logout (or a
    // different user logging in) we never show the previous user's cart.
    const [cart, setCart] = useState({ ownerId: null, items: [] })
    const [failedFor, setFailedFor] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)
    const [pendingIds, setPendingIds] = useState(() => new Set())

    useEffect(() => {
        if (!userId) return
        let mounted = true

        axiosInstance
            .get('/cart')
            .then(({ data }) => {
                if (!mounted) return
                setCart({ ownerId: userId, items: data.cart })
                setFailedFor(null)
            })
            .catch(() => mounted && setFailedFor(userId))

        return () => {
            mounted = false
        }
    }, [userId, reloadKey])

    const loaded = userId !== null && cart.ownerId === userId
    const cartItems = useMemo(() => (loaded ? cart.items : []), [loaded, cart.items])
    const error = userId !== null && failedFor === userId
    const loading = userId !== null && !loaded && !error

    const refreshCart = useCallback(() => {
        setFailedFor(null)
        setCart({ ownerId: null, items: [] })
        setReloadKey((k) => k + 1)
    }, [])

    // Every mutation returns the updated cart from the server, and that response
    // replaces our copy — MongoDB stays the source of truth. Errors are re-thrown
    // so the component that triggered the action can show the message.
    const mutate = useCallback(
        async (productId, request) => {
            setPendingIds((prev) => new Set(prev).add(productId))
            try {
                const { data } = await request()
                setCart({ ownerId: userId, items: data.cart })
                return data
            } finally {
                setPendingIds((prev) => {
                    const next = new Set(prev)
                    next.delete(productId)
                    return next
                })
            }
        },
        [userId]
    )

    const addToCart = useCallback(
        (productId) => mutate(productId, () => axiosInstance.post(`/cart/${productId}`)),
        [mutate]
    )

    const updateQuantity = useCallback(
        (productId, quantity) => mutate(productId, () => axiosInstance.patch(`/cart/${productId}`, { quantity })),
        [mutate]
    )

    const removeFromCart = useCallback(
        (productId) => mutate(productId, () => axiosInstance.delete(`/cart/${productId}`)),
        [mutate]
    )

    // Called after the server has verified a payment and emptied the cart in
    // MongoDB — mirrors that here so the navbar drops to Cart (0) straight away.
    const clearCart = useCallback(() => setCart({ ownerId: userId, items: [] }), [userId])

    const value = useMemo(() => {
        // Derived values — calculated from cartItems, never stored.
        const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        return {
            cartItems,
            loading,
            error,
            totalUnits,
            subtotal,
            addToCart,
            updateQuantity,
            removeFromCart,
            refreshCart,
            clearCart,
            isPending: (productId) => pendingIds.has(productId),
            quantityInCart: (productId) => cartItems.find((item) => item.product._id === productId)?.quantity ?? 0,
        }
    }, [cartItems, loading, error, pendingIds, addToCart, updateQuantity, removeFromCart, refreshCart, clearCart])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
