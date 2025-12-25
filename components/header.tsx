"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Plus, Minus, Send } from "lucide-react"
import { useCart } from "@/context/cart-context"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { optimizeImage } from "@/lib/utils"

interface HeaderProps {
    initialLogoData?: {
        hasLogo: boolean
        url: string | null
        logoText: string
        showBoth: boolean
    }
}

export function Header({ initialLogoData }: HeaderProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoData?.url || null)
    const [logoText, setLogoText] = useState<string>(initialLogoData?.logoText || "STUDIO")
    const [showBoth, setShowBoth] = useState<boolean>(initialLogoData?.showBoth || false)
    const [mounted, setMounted] = useState(false)
    const { items, removeFromCart, addToCart, totalPrice, totalItems } = useCart()

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!initialLogoData) {
            fetch('/api/logo')
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => {
                    if (data.hasLogo) setLogoUrl(data.url)
                    if (data.logoText) setLogoText(data.logoText)
                    if (data.showBoth !== undefined) setShowBoth(data.showBoth)
                })
                .catch(() => { })
        }
    }, [initialLogoData])

    const handleWhatsAppPurchase = () => {
        const message = `Merhaba, şu ürünleri satın almak istiyorum:\n\n${items.map(item => `- ${item.title} (${item.size}) x${item.quantity} - ${item.price * item.quantity} ₺`).join('\n')}\n\nToplam: ${totalPrice} ₺`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/905452798315?text=${encodedMessage}`, '_blank');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md" suppressHydrationWarning>
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    {logoUrl && (
                        <div className="relative h-8 w-auto min-w-[2rem] max-w-[120px] flex items-center">
                            <Image
                                src={optimizeImage(logoUrl, 240)}
                                alt="Logo"
                                height={32}
                                width={120}
                                className="h-full w-auto object-contain"
                                priority
                            />
                        </div>
                    )}
                    {(showBoth || !logoUrl) && (
                        <span className="text-sm font-bold tracking-tight text-black uppercase">
                            {logoText}
                        </span>
                    )}
                </Link>

                {/* Cart Icon */}
                {mounted && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-12 w-12 text-black hover:bg-neutral-100 rounded-full transition-all">
                                <ShoppingBag className="h-6 w-6" />
                                {totalItems > 0 && (
                                    <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                        {totalItems}
                                    </span>
                                )}
                                <span className="sr-only">Sepet</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-6">
                            <SheetHeader className="border-b pb-4">
                                <SheetTitle className="text-xl font-bold text-black uppercase tracking-tight text-left">
                                    SEPETİM
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex-grow overflow-y-auto py-6 space-y-6">
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-4">
                                        <ShoppingBag className="h-12 w-12 stroke-1" />
                                        <p className="text-sm font-medium">Sepetiniz henüz boş.</p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="relative h-24 w-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                                                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                            </div>
                                            <div className="flex flex-col justify-between flex-grow">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-black leading-tight">{item.title}</h3>
                                                    <p className="text-[10px] text-neutral-400 uppercase mt-1">{item.size}</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center border rounded-full h-7 px-1">
                                                        <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-black text-neutral-400 transition-colors">
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-xs font-semibold w-6 text-center">{item.quantity}</span>
                                                        <button onClick={() => addToCart(item)} className="p-1 hover:text-black text-neutral-400 transition-colors">
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <span className="text-sm font-bold">{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {items.length > 0 && (
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-500">Ara Toplam</span>
                                        <span className="text-lg font-bold text-black">{totalPrice.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <Button onClick={handleWhatsAppPurchase} className="w-full h-12 bg-black text-white hover:bg-neutral-800 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                        <Send className="h-4 w-4" />
                                        WhatsApp ile Satın Al
                                    </Button>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </header>
    )
}
