"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { optimizeImage } from "@/lib/utils"

interface Product {
    id: string
    title: string
    description: string
    size: string
    price: number
    imageUrl: string
    technique?: string | null
    isSold: boolean
}

interface ProductClientProps {
    initialProduct: Product
    initialLogoData: {
        hasLogo: boolean
        url: string | null
        logoText: string
        showBoth: boolean
        detailTitleSize?: string
        detailTitleWeight?: string
        detailPriceSize?: string
        detailPriceWeight?: string
    }
}

export function ProductClient({ initialProduct, initialLogoData }: ProductClientProps) {
    const [product] = useState<Product>(initialProduct)
    const { addToCart } = useCart()

    if (!product) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-white flex flex-col">
            <Header initialLogoData={initialLogoData} />

            <div className="container mx-auto px-4 py-24 flex-grow">
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
                            src={optimizeImage(product.imageUrl, 1200)}
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
                            <h1
                                className="text-5xl font-extrabold text-black tracking-tighter mb-4 leading-tight"
                                style={{
                                    fontSize: initialLogoData.detailTitleSize || "3rem",
                                    fontWeight: initialLogoData.detailTitleWeight || "800"
                                }}
                            >
                                {product.title}
                            </h1>
                            <div className="flex flex-col gap-2">
                                {product.technique && (
                                    <div className="inline-block px-3 py-1 bg-neutral-100 rounded-full w-fit">
                                        <span className="text-[10px] font-bold tracking-widest text-neutral-500">
                                            {product.technique}
                                        </span>
                                    </div>
                                )}
                                <div className="inline-block px-3 py-1 bg-neutral-100 rounded-full w-fit">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                        {product.size}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">
                                AÇIKLAMA
                            </h2>
                            <p className="text-neutral-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto pt-10 border-t border-neutral-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Fiyat</span>
                                <span
                                    className="text-3xl font-bold text-black"
                                    style={{
                                        fontSize: initialLogoData.detailPriceSize || "1.875rem",
                                        fontWeight: initialLogoData.detailPriceWeight || "700"
                                    }}
                                >
                                    {product.price.toLocaleString('tr-TR')} ₺
                                </span>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => !product.isSold && addToCart(product)}
                                disabled={product.isSold}
                                className={`w-full sm:flex-1 h-16 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl transition-all ${product.isSold ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-black text-white hover:bg-neutral-800 hover:scale-105 active:scale-95'}`}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {product.isSold ? "SATILDI" : "SEPETE EKLE"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
