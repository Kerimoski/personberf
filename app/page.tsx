import { ProductCard } from "@/components/product-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getLogoSettings } from "@/lib/settings"

interface Product {
  id: string
  title: string
  description: string
  size: string
  price: number
  imageUrl: string
  imagePublicId: string
  isPublished: boolean
  isSold: boolean
  order: number
  createdAt: string
  updatedAt: string
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products`, {
      cache: 'no-store'
    })

    if (!res.ok) {
      return []
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function Home() {
  const products = await getProducts()
  const logoSettings = await getLogoSettings()

  return (
    <main className="min-h-screen bg-white">
      <Header initialLogoData={logoSettings} />

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-sm text-neutral-500 tracking-wide">
              Henüz ürün bulunmamaktadır
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                size={product.size}
                price={product.price}
                imageUrl={product.imageUrl}
                isSold={product.isSold}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
