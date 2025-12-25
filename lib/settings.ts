import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const LOGO_PATH = join(process.cwd(), "public", "logo.png")
const LOGO_TEXT_PATH = join(process.cwd(), "public", "logo-text.json")

export interface LogoData {
    hasLogo: boolean
    url: string | null
    logoText: string
    showBoth: boolean
}

export async function getLogoSettings(): Promise<LogoData> {
    let logoText = "STUDIO"
    let hasLogo = false
    let url = null
    let showBoth = false

    try {
        if (existsSync(LOGO_TEXT_PATH)) {
            const textData = await readFile(LOGO_TEXT_PATH, 'utf-8')
            const parsed = JSON.parse(textData)
            logoText = parsed.text || "STUDIO"
            showBoth = !!parsed.showBoth
        }

        if (existsSync(LOGO_PATH)) {
            hasLogo = true
            url = `/logo.png?t=${Date.now()}`
        }
    } catch (error) {
        console.error("Error reading logo settings:", error)
    }

    return {
        hasLogo,
        url,
        logoText,
        showBoth
    }
}
