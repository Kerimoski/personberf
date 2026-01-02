"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

export default function AddProduct() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imagePreview, setImagePreview] = useState<string>("")
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        size: "",
        price: "",
        imageUrl: "",
        imagePublicId: "",
        technique: ""
    })

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            setImagePreview(base64)

            try {
                setIsUploadingImage(true)
                console.log("Starting image upload...")
                const res = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file: base64 })
                })

                if (res.ok) {
                    const data = await res.json()
                    setFormData(prev => ({
                        ...prev,
                        imageUrl: data.url,
                        imagePublicId: data.publicId
                    }))
                }
            } catch {
                console.error("Image upload failed")
            } finally {
                setIsUploadingImage(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log("Form data before submit:", formData)

        if (!formData.imageUrl) {
            alert("Lütfen bir görsel yükleyin")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push("/admin/dashboard")
                router.refresh()
            } else {
                const error = await res.json()
                console.error("Server error:", error)
                alert("Ürün eklenirken hata oluştu: " + (error.error || "Bilinmeyen hata"))
            }
        } catch (error) {
            console.error("Error creating product:", error)
            alert("Ürün eklenirken hata oluştu")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-neutral-600 hover:text-black">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Geri
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <h1 className="text-2xl font-medium mb-8">Yeni Ürün Ekle</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-sm font-medium">
                            Ürün Görseli
                        </Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                            className="h-11"
                        />
                        {imagePreview && (
                            <div className="relative aspect-[3/4] max-w-sm bg-neutral-100 mt-4 rounded-lg overflow-hidden border border-neutral-200">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className={cn(
                                        "object-cover w-full h-full transition-opacity duration-300",
                                        isUploadingImage ? "opacity-40" : "opacity-100"
                                    )}
                                />
                                {isUploadingImage && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px]">
                                        <Loader2 className="h-10 w-10 text-black animate-spin mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-black">Görsel Yükleniyor...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Başlık
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: Manzara Tablosu"
                            required
                            className="h-11"
                        />
                    </div>

                    {/* Size */}
                    <div className="space-y-2">
                        <Label htmlFor="size" className="text-sm font-medium">
                            Boyut
                        </Label>
                        <Input
                            id="size"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            placeholder="Örn: 50x70 cm"
                            required
                            className="h-11"
                        />
                    </div>

                    {/* Technique */}
                    <div className="space-y-2">
                        <Label htmlFor="technique" className="text-sm font-medium">
                            Teknik Bilgi
                        </Label>
                        <Input
                            id="technique"
                            value={formData.technique}
                            onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                            placeholder="Örn: Tuval Üzeri Yağlı Boya (Opsiyonel)"
                            className="h-11"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-medium">
                            Fiyat (₺)
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="Örn: 1500"
                            required
                            className="h-11"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Açıklama
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ürün hakkında detaylı bilgi..."
                            rows={6}
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Link href="/admin/dashboard" className="flex-1">
                            <Button type="button" variant="outline" className="w-full h-11">
                                İptal
                            </Button>
                        </Link>
                        <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
                            {isLoading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    )
}
