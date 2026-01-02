import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { file } = await req.json()

        // Upload to Cloudinary with optimization
        const result = await cloudinary.uploader.upload(file, {
            folder: "art-products",
            resource_type: "auto",
            transformation: [
                { width: 2000, height: 2000, crop: "limit" }, // Resize down if larger than 2000px
                { quality: "auto" } // Automatic quality optimization for storage
            ]
        })

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id
        })
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error)
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        )
    }
}

// DELETE image from Cloudinary
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { publicId } = await req.json()

        await cloudinary.uploader.destroy(publicId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error)
        return NextResponse.json(
            { error: "Failed to delete image" },
            { status: 500 }
        )
    }
}
