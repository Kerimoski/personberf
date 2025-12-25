import { db } from "./db"

export interface LogoData {
    hasLogo: boolean
    url: string | null
    logoText: string
    showBoth: boolean
}

export async function getLogoSettings(): Promise<LogoData> {
    try {
        const settings = await db.settings.findUnique({
            where: { id: "site-settings" }
        })

        if (settings) {
            return {
                hasLogo: !!settings.logoUrl,
                url: settings.logoUrl,
                logoText: settings.logoText,
                showBoth: settings.showBoth
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
        showBoth: false
    }
}
