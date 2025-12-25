"use client"

import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
    id: string
    title: string
    size: string
    price: number
    imageUrl: string
    isSold: boolean
}

import { Plus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { optimizeImage } from "@/lib/utils"

export function ProductCard({ id, title, size, price, imageUrl, isSold }: ProductCardProps) {
    const { addToCart } = useCart()
    const optimizedImageUrl = optimizeImage(imageUrl, 600) // Optimize for typical card width

    return (
        <div className={`group relative flex flex-col bg-white rounded-2xl border border-neutral-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden ${isSold ? 'opacity-90' : ''}`}>
            {/* Image Wrapper */}
            <Link href={`/product/${id}`} className="relative aspect-[4/5] overflow-hidden">
                <Image
                    src={optimizedImageUrl}
                    alt={title}
                    fill
                    className={`object-cover transition-transform duration-700 ${isSold ? '' : 'group-hover:scale-110'}`}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                {isSold && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="bg-white text-black px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl scale-110">
                            SATILDI
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Info Section - Tightly Integrated */}
            <div className="px-5 py-5 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <Link href={`/product/${id}`}>
                        <h3 className="text-[15px] font-bold text-neutral-900 leading-tight group-hover:text-black transition-colors">
                            {title}
                        </h3>
                    </Link>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.1em]">
                        {size}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-black text-black tracking-tight">
                        {price.toLocaleString('tr-TR')} ₺
                    </span>
                    <Button
                        size="icon"
                        onClick={() => !isSold && addToCart({ id, title, price, imageUrl, size })}
                        disabled={isSold}
                        className={`h-10 w-10 rounded-xl transition-all shadow-lg active:scale-95 ${isSold ? 'bg-neutral-100 text-neutral-400' : 'bg-black text-white hover:bg-neutral-800 hover:scale-110'}`}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
