import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// GET logo and text
export async function GET() {
    try {
        const settings = await db.settings.findUnique({
            where: { id: "site-settings" }
        })

        if (!settings) {
            return NextResponse.json({
                hasLogo: false,
                logoText: "STUDIO",
                showBoth: false
            })
        }

        return NextResponse.json({
            hasLogo: !!settings.logoUrl,
            url: settings.logoUrl,
            logoText: settings.logoText,
            showBoth: settings.showBoth
        })
    } catch (error) {
        console.error("Critical error in logo GET:", error)
        return NextResponse.json({
            hasLogo: false,
            logoText: "STUDIO",
            showBoth: false
        }, { status: 200 })
    }
}

// POST update logo/text
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        // Handle settings update (text or showBoth)
        if (body.text !== undefined || body.showBoth !== undefined) {
            const settings = await db.settings.upsert({
                where: { id: "site-settings" },
                update: {
                    ...(body.text !== undefined && { logoText: body.text }),
                    ...(body.showBoth !== undefined && { showBoth: body.showBoth })
                },
                create: {
                    id: "site-settings",
                    logoText: body.text || "STUDIO",
                    showBoth: body.showBoth || false
                }
            })

            return NextResponse.json({
                success: true,
                text: settings.logoText,
                showBoth: settings.showBoth
            })
        }

        // Handle logo image upload to Cloudinary
        if (body.file) {
            const uploadResponse = await cloudinary.uploader.upload(body.file, {
                folder: "art-gallery-logo",
                resource_type: "auto"
            })

            const settings = await db.settings.upsert({
                where: { id: "site-settings" },
                update: {
                    logoUrl: uploadResponse.secure_url
                },
                create: {
                    id: "site-settings",
                    logoUrl: uploadResponse.secure_url,
                    logoText: "STUDIO",
                    showBoth: false
                }
            })

            return NextResponse.json({
                success: true,
                url: settings.logoUrl
            })
        }

        return NextResponse.json({ error: "No data provided" }, { status: 400 })
    } catch (error) {
        console.error("Error updating logo settings:", error)
        return NextResponse.json({ error: "Failed to update logo" }, { status: 500 })
    }
}

// DELETE logo
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await db.settings.update({
            where: { id: "site-settings" },
            data: { logoUrl: null }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting logo:", error)
        return NextResponse.json({ error: "Failed to delete logo" }, { status: 500 })
    }
}
