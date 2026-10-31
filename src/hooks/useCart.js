import { useState, useEffect } from 'react'

const CART_KEY = 'bore_barrel_cart'

export function useCart() {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_KEY)
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart))
        } catch (e) {
            console.error(e)
        }
    }, [cart])

    const addToCart = (gun) => {
        setCart((prev) => {
            const id = gun.id || gun.name
            const existing = prev.find((item) => (item.id || item.name) === id)
            if (existing) {
                return prev.map((item) =>
                    (item.id || item.name) === id ? { ...item, qty: item.qty + 1 } : item
                )
            }
            return [...prev, { ...gun, qty: 1 }]
        })
    }

    const updateQty = (id, delta) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if ((item.id || item.name) === id) {
                        const newQty = item.qty + delta
                        return newQty > 0 ? { ...item, qty: newQty } : null
                    }
                    return item
                })
                .filter(Boolean)
        )
    }

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => (item.id || item.name) !== id))
    }

    const clearCart = () => setCart([])

    // Format link WhatsApp untuk Checkout
    const checkoutWhatsApp = (phone = '6281234567890') => {
        if (cart.length === 0) return
        let text = 'Hi aku mau pesan senjata berikut:\n\n'
        let total = 0
        cart.forEach((item, index) => {
            const price = Number(item.price ?? item.cook_time ?? 0)
            const subtotal = price * item.qty
            total += subtotal
            text += `${index + 1}. ${item.name} (${item.qty}x) - $${subtotal.toLocaleString()}\n`
        })
        text += `\n*Total Tagihan: $${total.toLocaleString()}*\nMohon konfirmasi ketersediaan barang. Terima kasih!`
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0)
    const totalPrice = cart.reduce(
        (acc, item) => acc + Number(item.price ?? item.cook_time ?? 0) * item.qty,
        0
    )

    return { cart, addToCart, updateQty, removeFromCart, clearCart, checkoutWhatsApp, totalItems, totalPrice }
}