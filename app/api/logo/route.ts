import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { writeFile, readFile, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const LOGO_PATH = join(process.cwd(), "public", "logo.png")
const LOGO_TEXT_PATH = join(process.cwd(), "public", "logo-text.json")

// GET logo and text
export async function GET() {
    try {
        let logoText = "STUDIO" // default
        let showBoth = false

        // Check for custom settings
        try {
            if (existsSync(LOGO_TEXT_PATH)) {
                const textData = await readFile(LOGO_TEXT_PATH, 'utf-8')
                const parsed = JSON.parse(textData)
                logoText = parsed.text || "STUDIO"
                showBoth = !!parsed.showBoth
            }
        } catch (textError) {
            console.error("Error reading logo settings:", textError)
        }

        // Check for logo image
        try {
            if (existsSync(LOGO_PATH)) {
                return NextResponse.json({
                    hasLogo: true,
                    url: `/logo.png?t=${Date.now()}`,
                    logoText,
                    showBoth
                })
            }
        } catch (logoError) {
            console.error("Error reading logo image:", logoError)
        }

        return NextResponse.json({
            hasLogo: false,
            logoText,
            showBoth
        })
    } catch (error) {
        console.error("Critical error in logo GET:", error)
        // Always return valid JSON, never let this throw
        return NextResponse.json({
            hasLogo: false,
            logoText: "STUDIO",
            showBoth: false
        }, { status: 200 })
    }
}

// POST upload logo
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()

        // Handle settings update (text or showBoth)
        if (body.text !== undefined || body.showBoth !== undefined) {
            let currentSettings = { text: "STUDIO", showBoth: false }
            if (existsSync(LOGO_TEXT_PATH)) {
                const data = await readFile(LOGO_TEXT_PATH, 'utf-8')
                currentSettings = JSON.parse(data)
            }

            const newSettings = {
                ...currentSettings,
                ...(body.text !== undefined && { text: body.text }),
                ...(body.showBoth !== undefined && { showBoth: body.showBoth })
            }

            await writeFile(LOGO_TEXT_PATH, JSON.stringify(newSettings))
            return NextResponse.json({
                success: true,
                ...newSettings
            })
        }

        // Handle logo image upload
        if (body.file) {
            const base64Data = body.file.replace(/^data:image\/\w+;base64,/, "")
            const buffer = Buffer.from(base64Data, 'base64')

            if (existsSync(LOGO_PATH)) {
                await unlink(LOGO_PATH)
            }

            await writeFile(LOGO_PATH, buffer)

            return NextResponse.json({
                success: true,
                url: `/logo.png?t=${Date.now()}`
            })
        }

        return NextResponse.json(
            { error: "No file or text provided" },
            { status: 400 }
        )
    } catch (error) {
        console.error("Error uploading logo:", error)
        return NextResponse.json(
            { error: "Failed to upload logo" },
            { status: 500 }
        )
    }
}

// DELETE logo
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        if (existsSync(LOGO_PATH)) {
            await unlink(LOGO_PATH)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting logo:", error)
        return NextResponse.json(
            { error: "Failed to delete logo" },
            { status: 500 }
        )
    }
}
