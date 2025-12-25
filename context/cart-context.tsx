"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Product {
    id: string
    title: string
    price: number
    imageUrl: string
    size: string
}

interface CartItem extends Product {
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product) => void
    removeFromCart: (productId: string) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [mounted, setMounted] = useState(false)

    // Load cart from local storage on mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
        const savedCart = localStorage.getItem('art-gallery-cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart:', e)
            }
        }
    }, [])

    // Save cart to local storage when it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('art-gallery-cart', JSON.stringify(items))
        }
    }, [items, mounted])

    const addToCart = (product: Product) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id)
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prevItems, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId: string) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === productId)
            if (existingItem && existingItem.quantity > 1) {
                return prevItems.map((item) =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                )
            }
            return prevItems.filter((item) => item.id !== productId)
        })
    }

    const clearCart = () => {
        setItems([])
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
