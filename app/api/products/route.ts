import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// GET all products (public/admin)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        const products = await db.product.findMany({
            where: session ? {} : {
                isPublished: true
            },
            orderBy: [
                { isSold: "asc" },
                { order: "asc" }
            ]
        })
        return NextResponse.json(products)
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        )
    }
}

// POST new product (admin only)
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
        const { title, description, size, price, imageUrl, imagePublicId } = body

        // Find max order to set as the last
        const lastProduct = await db.product.findFirst({
            orderBy: {
                order: 'desc'
            }
        })
        const nextOrder = (lastProduct?.order ?? -1) + 1

        const product = await db.product.create({
            data: {
                title,
                description,
                size,
                price: parseFloat(price),
                imageUrl,
                imagePublicId,
                order: nextOrder
            }
        })

        revalidatePath("/")
        revalidatePath("/admin/dashboard")

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        )
    }
}
