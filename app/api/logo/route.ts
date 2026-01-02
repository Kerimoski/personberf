import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
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
                detailPriceWeight: "bold"
            })
        }

        const s = settings as any;

        return NextResponse.json({
            hasLogo: !!settings.logoUrl,
            url: settings.logoUrl,
            logoText: settings.logoText,
            showBoth: settings.showBoth,
            // Typography with fallbacks for null values
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
            detailPriceWeight: s.detailPriceWeight || "bold"
        })
    } catch (error) {
        console.error("Critical error in logo GET:", error)
        return NextResponse.json({
            hasLogo: false,
            logoText: "STUDIO",
            showBoth: false,
            cardTitleSize: "17px",
            cardTitleWeight: "bold"
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

            revalidatePath("/")

            return NextResponse.json({
                success: true,
                ...settings
            })
        }

        // Handle generic settings update (Typography etc.)
        const typographyFields = [
            'cardTitleSize', 'cardTitleWeight',
            'cardTechniqueSize', 'cardTechniqueWeight',
            'cardPriceSize', 'cardPriceWeight',
            'cardDetailSize', 'cardDetailWeight',
            'detailTitleSize', 'detailTitleWeight',
            'detailPriceSize', 'detailPriceWeight'
        ]

        const hasTypographyUpdate = typographyFields.some(f => body[f] !== undefined)

        if (hasTypographyUpdate) {
            const updateData: any = {}
            typographyFields.forEach(f => {
                if (body[f] !== undefined) updateData[f] = body[f]
            })

            const settings = await db.settings.upsert({
                where: { id: "site-settings" },
                update: updateData,
                create: {
                    id: "site-settings",
                    ...updateData
                }
            })

            revalidatePath("/")
            revalidatePath("/admin/dashboard")

            return NextResponse.json({
                success: true,
                ...settings
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

            revalidatePath("/")

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

        revalidatePath("/")

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting logo:", error)
        return NextResponse.json({ error: "Failed to delete logo" }, { status: 500 })
    }
}
