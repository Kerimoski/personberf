import { db } from "./db"

export interface LogoData {
    hasLogo: boolean
    url: string | null
    logoText: string
    showBoth: boolean
    cardTitleSize: string
    cardTitleWeight: string
    cardTechniqueSize: string
    cardTechniqueWeight: string
    cardPriceSize: string
    cardPriceWeight: string
    cardDetailSize: string
    cardDetailWeight: string
    detailTitleSize: string
    detailTitleWeight: string
    detailPriceSize: string
    detailPriceWeight: string
}

export async function getLogoSettings(): Promise<LogoData> {
    try {
        const settings = await db.settings.findUnique({
            where: { id: "site-settings" }
        })

        if (settings) {
            const s = settings as any;
            return {
                hasLogo: !!settings.logoUrl,
                url: settings.logoUrl,
                logoText: settings.logoText,
                showBoth: settings.showBoth,
                cardTitleSize: s.cardTitleSize || "17px",
                cardTitleWeight: s.cardTitleWeight || "bold",
                cardTechniqueSize: s.cardTechniqueSize || "10px",
                cardTechniqueWeight: s.cardTechniqueWeight || "bold",
                cardPriceSize: s.cardPriceSize || "18px",
                cardPriceWeight: s.cardPriceWeight || "bold",
                cardDetailSize: s.cardDetailSize || "10px",
                cardDetailWeight: s.cardDetailWeight || "bold",
                detailTitleSize: s.detailTitleSize || "48px",
                detailTitleWeight: s.detailTitleWeight || "extrabold",
                detailPriceSize: s.detailPriceSize || "30px",
                detailPriceWeight: s.detailPriceWeight || "bold",
            }
        }
    } catch (error) {
        console.error("Error reading logo settings from DB:", error)
    }

    // Default values if no settings found
    return {
        hasLogo: false,
        url: null,
        logoText: "STUDIO",
        showBoth: false,
        cardTitleSize: "17px",
        cardTitleWeight: "bold",
        cardTechniqueSize: "10px",
        cardTechniqueWeight: "bold",
        cardPriceSize: "18px",
        cardPriceWeight: "bold",
        cardDetailSize: "10px",
        cardDetailWeight: "bold",
        detailTitleSize: "48px",
        detailTitleWeight: "extrabold",
        detailPriceSize: "30px",
        detailPriceWeight: "bold",
    }
}
