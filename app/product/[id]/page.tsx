import { getLogoSettings } from "@/lib/settings"
import { ProductClient } from "./product-client"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const logoSettings = await getLogoSettings()

    return <ProductClient id={id} initialLogoData={logoSettings} />
}
