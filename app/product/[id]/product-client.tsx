"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useState, useEffect, use } from "react"
import { useCart } from "@/context/cart-context"

interface Product {
    id: string
    title: string
    description: string
    size: string
    price: number
    imageUrl: string
}

interface ProductClientProps {
    id: string
    initialLogoData: {
        hasLogo: boolean
        url: string | null
        logoText: string
    }
}

export function ProductClient({ id, initialLogoData }: ProductClientProps) {
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { addToCart } = useCart()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setProduct(data)
                }
            } catch (error) {
                console.error('Error fetching product:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    if (isLoading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Yükleniyor...</div>
    }

    if (!product) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-white">
            <Header initialLogoData={initialLogoData} />

            <div className="container mx-auto px-4 py-12">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black mb-12 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    KOLEKSİYONA DÖN
                </Link>

                {/* Product Detail */}
                <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-neutral-50 rounded-2xl overflow-hidden shadow-2xl">
                        <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-center max-w-lg">
                        <div className="mb-10">
                            <h1 className="text-4xl font-extrabold text-black tracking-tighter mb-4 leading-tight">
                                {product.title}
                            </h1>
                            <div className="inline-block px-3 py-1 bg-neutral-100 rounded-full">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                    {product.size}
                                </span>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">
                                AÇIKLAMA
                            </h2>
                            <p className="text-neutral-600 leading-relaxed text-lg font-medium">
                                {product.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto pt-10 border-t border-neutral-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Fiyat</span>
                                <span className="text-3xl font-black text-black">
                                    {product.price.toLocaleString('tr-TR')} ₺
                                </span>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => addToCart(product)}
                                className="w-full sm:flex-1 h-16 bg-black text-white hover:bg-neutral-800 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                SEPETE EKLE
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
