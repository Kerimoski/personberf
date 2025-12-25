"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
    id: string
    title: string
    description: string
    size: string
    price: number
    imageUrl: string
    imagePublicId: string
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use<{ id: string }>(params)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imagePreview, setImagePreview] = useState<string>("")
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        size: "",
        price: "",
        imageUrl: "",
        imagePublicId: ""
    })

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`)
                const data: Product = await res.json()

                setFormData({
                    title: data.title,
                    description: data.description,
                    size: data.size,
                    price: data.price.toString(),
                    imageUrl: data.imageUrl,
                    imagePublicId: data.imagePublicId
                })
                setImagePreview(data.imageUrl)
            } catch (error) {
                console.error("Error fetching product:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            setImagePreview(base64)

            try {
                setIsUploadingImage(true)
                if (formData.imagePublicId) {
                    await fetch("/api/upload", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ publicId: formData.imagePublicId })
                    })
                }

                const res = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file: base64 })
                })

                const data = await res.json()
                setFormData(prev => ({
                    ...prev,
                    imageUrl: data.url,
                    imagePublicId: data.publicId
                }))
            } catch (error) {
                console.error("Error uploading image:", error)
                alert("Görsel yüklenirken hata oluştu")
            } finally {
                setIsUploadingImage(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push("/admin/dashboard")
                router.refresh()
            } else {
                alert("Ürün güncellenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error updating product:", error)
            alert("Ürün güncellenirken hata oluştu")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-neutral-500">Yükleniyor...</p>
            </div>
        )
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
                <h1 className="text-2xl font-medium mb-8">Ürünü Düzenle</h1>

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
                            required
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
                        <Button type="submit" className="flex-1 h-11" disabled={isSaving}>
                            {isSaving ? "Güncelleniyor..." : "Güncelle"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
