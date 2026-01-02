import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

// GET single product (public)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const product = await db.product.findUnique({
            where: { id }
        })

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error fetching product:", error)
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        )
    }
}

// PATCH update product (admin only)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await req.json()
        const { title, description, size, price, imageUrl, imagePublicId, technique, isPublished } = body

        const product = await db.product.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(size && { size }),
                ...(price && { price: parseFloat(price) }),
                ...(imageUrl && { imageUrl }),
                ...(imagePublicId && { imagePublicId }),
                ...(technique !== undefined && { technique }),
                ...(isPublished !== undefined && { isPublished })
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error updating product:", error)
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        )
    }
}

// DELETE product (admin only)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        await db.product.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting product:", error)
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        )
    }
}
