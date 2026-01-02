"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/footer"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Plus, LogOut, Upload, X, AlertCircle, ChevronUp, ChevronDown, CheckCircle2, Eye, EyeOff } from "lucide-react"

interface Product {
    id: string
    title: string
    size: string
    price: number
    imageUrl: string
    imagePublicId: string
    order: number
    isSold: boolean
    isPublished: boolean
}

interface DashboardClientProps {
    initialLogoData: {
        hasLogo: boolean
        url: string | null
        logoText: string
        showBoth: boolean
    }
}

export function DashboardClient({ initialLogoData }: DashboardClientProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoData.url)
    const [logoText, setLogoText] = useState<string>(initialLogoData.logoText)
    const [logoTextInput, setLogoTextInput] = useState(initialLogoData.logoText)
    const [showBoth, setShowBoth] = useState<boolean>(initialLogoData.showBoth)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products")
            if (!res.ok) {
                throw new Error('Ürünler getirilemedi')
            }
            const data = await res.json()
            if (Array.isArray(data)) {
                setProducts(data)
            } else {
                console.error("Dönen veri dizi değil:", data)
                setProducts([])
            }
        } catch (error) {
            console.error("Error fetching products:", error)
            setProducts([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        try {
            const res = await fetch("/api/products/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, direction })
            })

            if (res.ok) {
                fetchProducts()
            }
        } catch (error) {
            console.error("Error reordering:", error)
        }
    }

    const handleToggleSold = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/products/${id}/toggle-sold`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isSold: !currentStatus })
            })

            if (res.ok) {
                fetchProducts()
            }
        } catch (error) {
            console.error("Error toggling sold status:", error)
        }
    }

    const handleTogglePublished = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: !currentStatus })
            })

            if (res.ok) {
                fetchProducts()
            }
        } catch (error) {
            console.error("Error toggling published status:", error)
        }
    }



    const handleLogoTextSave = async () => {
        if (!logoTextInput.trim()) {
            alert("Lütfen bir text girin")
            return
        }

        try {
            const res = await fetch("/api/logo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: logoTextInput })
            })

            if (res.ok) {
                setLogoText(logoTextInput)
            } else {
                alert("Text kaydedilirken hata oluştu")
            }
        } catch (error) {
            console.error("Error saving logo text:", error)
            alert("Text kaydedilirken hata oluştu")
        }
    }

    const handleToggleShowBoth = async () => {
        try {
            const newStatus = !showBoth
            const res = await fetch("/api/logo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ showBoth: newStatus })
            })

            if (res.ok) {
                setShowBoth(newStatus)
            } else {
                alert("Ayar kaydedilirken hata oluştu")
            }
        } catch (error) {
            console.error("Error toggling showBoth:", error)
            alert("Ayar kaydedilirken hata oluştu")
        }
    }

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            setLogoPreview(base64)
            setIsUploadingLogo(true)

            try {
                const res = await fetch("/api/logo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file: base64 })
                })

                const data = await res.json()
                if (res.ok) {
                    setLogoUrl(data.url)
                    window.location.reload()
                } else {
                    alert("Logo yüklenirken hata oluştu")
                    setLogoPreview(null)
                }
            } catch (error) {
                console.error("Error uploading logo:", error)
                alert("Logo yüklenirken hata oluştu")
                setLogoPreview(null)
            } finally {
                setIsUploadingLogo(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleDeleteLogo = async () => {
        if (!confirm("Logoyu silmek istediğinizden emin misiniz?")) return

        try {
            await fetch("/api/logo", { method: "DELETE" })
            setLogoUrl(null)
            setLogoPreview(null)
            window.location.reload()
        } catch (error) {
            console.error("Error deleting logo:", error)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            const product = products.find(p => p.id === deleteId)
            if (product) {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publicId: product.imagePublicId })
                })
            }

            await fetch(`/api/products/${deleteId}`, {
                method: "DELETE"
            })

            setProducts(products.filter(p => p.id !== deleteId))
            setDeleteId(null)
        } catch (error) {
            console.error("Error deleting product:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        {logoUrl && (
                            <div className="relative h-8 w-auto min-w-[2rem] max-w-[120px] flex items-center">
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="h-full w-auto object-contain"
                                />
                            </div>
                        )}
                        {(showBoth || !logoUrl) && (
                            <span className="text-sm font-bold tracking-tight text-neutral-900">{logoText}</span>
                        )}
                    </Link>
                    <Button variant="ghost" onClick={handleLogout} className="text-sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Logo Upload Section */}
                <div className="mb-12 pb-12 border-b space-y-8">
                    <h2 className="text-xl font-medium">Logo</h2>

                    {/* Logo Image */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">Logo Görseli</Label>
                        <div className="flex items-start gap-6">
                            {(logoUrl || logoPreview) && (
                                <div className="relative h-16 w-32 border rounded">
                                    <Image
                                        src={logoPreview || logoUrl || ""}
                                        alt="Current Logo"
                                        fill
                                        className="object-contain p-2"
                                    />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Label htmlFor="logo-upload" className="cursor-pointer">
                                    <div className="inline-flex items-center justify-center h-10 px-4 border bg-white hover:bg-neutral-50 rounded text-sm font-medium transition-colors">
                                        {isUploadingLogo ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                                Yükleniyor...
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                {logoUrl ? "Logo Değiştir" : "Logo Yükle"}
                                            </>
                                        )}
                                    </div>
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                        disabled={isUploadingLogo}
                                    />
                                </Label>
                                {logoUrl && !isUploadingLogo && (
                                    <Button
                                        variant="outline"
                                        size="default"
                                        onClick={handleDeleteLogo}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Logoyu Sil
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-amber-600 bg-amber-50 w-fit px-3 py-1.5 rounded-full border border-amber-100">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">
                                Önerilen Ideal Boyut: 300x80 px
                            </p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-3 block">
                            Logo Metni ve Ayarlar
                        </Label>
                        <div className="flex gap-3 max-w-md">
                            <Input
                                type="text"
                                value={logoTextInput}
                                onChange={(e) => setLogoTextInput(e.target.value)}
                                placeholder="Kurum adınız"
                                className="h-10"
                            />
                            <Button onClick={handleLogoTextSave} variant="outline">
                                Kaydet
                            </Button>
                        </div>
                        <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-xl border border-neutral-100 shadow-sm">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Logo ve Metin Birlikte</p>
                                <p className="text-[11px] text-neutral-500 italic">Görselin hemen yanında ismi gösterir</p>
                            </div>
                            <button
                                onClick={handleToggleShowBoth}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showBoth ? 'bg-black' : 'bg-neutral-200'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showBoth ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-medium">Ürünler</h2>
                    <Link href="/admin/dashboard/add">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Ürün
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <p className="text-center py-10 text-neutral-500">Yükleniyor...</p>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 border rounded">
                        <p className="text-sm text-neutral-500 mb-4">
                            Henüz ürün bulunmamaktadır
                        </p>
                        <Link href="/admin/dashboard/add">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                İlk Ürünü Ekle
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="border rounded">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Görsel</TableHead>
                                    <TableHead>Başlık</TableHead>
                                    <TableHead>Boyut</TableHead>
                                    <TableHead>Fiyat</TableHead>
                                    <TableHead className="text-center w-24">Sıralama</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(products) && products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="relative w-12 h-16 bg-neutral-100">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{product.title}</TableCell>
                                        <TableCell className="text-sm text-neutral-600">{product.size}</TableCell>
                                        <TableCell className="text-sm">{product.price.toLocaleString('tr-TR')} ₺</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-neutral-100"
                                                    onClick={() => handleReorder(product.id, 'up')}
                                                    disabled={products.indexOf(product) === 0}
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-neutral-100"
                                                    onClick={() => handleReorder(product.id, 'down')}
                                                    disabled={products.indexOf(product) === products.length - 1}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant={product.isSold ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleToggleSold(product.id, product.isSold)}
                                                className={product.isSold ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                                title={product.isSold ? "Satıldı" : "Satışta"}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            {product.isSold && (
                                                <Button
                                                    variant={product.isPublished ? "outline" : "default"}
                                                    size="sm"
                                                    onClick={() => handleTogglePublished(product.id, product.isPublished)}
                                                    className={!product.isPublished ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                                                    title={product.isPublished ? "Sitede Görünür" : "Siteden Gizli"}
                                                >
                                                    {product.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            <Link href={`/admin/dashboard/edit/${product.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeleteId(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ürünü Sil</DialogTitle>
                        <DialogDescription>
                            Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isDeleting}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Siliniyor..." : "Sil"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Footer />
        </div>
    )
}
