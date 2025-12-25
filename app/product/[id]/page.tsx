import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { getLogoSettings } from "@/lib/settings"
import { ProductClient } from "./product-client"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const logoSettings = await getLogoSettings()

    const product = await db.product.findUnique({
        where: { id }
    })

    if (!product) {
        notFound()
    }

    // Convert Dates to strings
    const serializedProduct = JSON.parse(JSON.stringify(product))

    return <ProductClient initialProduct={serializedProduct} initialLogoData={logoSettings} />
}
