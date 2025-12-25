import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id, direction } = await req.json()

        if (!id || !direction) {
            return NextResponse.json(
                { error: "ID and direction are required" },
                { status: 400 }
            )
        }

        const currentProduct = await db.product.findUnique({
            where: { id }
        })

        if (!currentProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            )
        }

        const currentOrder = currentProduct.order
        console.log(`REORDER: ID: ${id}, Direction: ${direction}, Current Order: ${currentOrder}`)

        let siblingProduct
        if (direction === 'up') {
            siblingProduct = await db.product.findFirst({
                where: {
                    isSold: currentProduct.isSold,
                    order: {
                        lt: currentOrder
                    }
                },
                orderBy: {
                    order: 'desc'
                }
            })
        } else if (direction === 'down') {
            siblingProduct = await db.product.findFirst({
                where: {
                    isSold: currentProduct.isSold,
                    order: {
                        gt: currentOrder
                    }
                },
                orderBy: {
                    order: 'asc'
                }
            })
        }

        if (!siblingProduct) {
            console.log(`REORDER: No sibling found for ${direction} move in group isSold:${currentProduct.isSold}`)
            return NextResponse.json({ message: "Already at the limit" }, { status: 200 })
        }

        console.log(`REORDER: Found sibling "${siblingProduct.title}" with order ${siblingProduct.order}. Swapping...`)

        // Swap orders
        await db.$transaction([
            db.product.update({
                where: { id: currentProduct.id },
                data: { order: siblingProduct.order }
            }),
            db.product.update({
                where: { id: siblingProduct.id },
                data: { order: currentOrder }
            })
        ])

        revalidatePath("/")
        revalidatePath("/admin/dashboard")

        console.log("REORDER: Swap complete.")

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error reordering products:", error)
        return NextResponse.json(
            { error: "Failed to reorder products" },
            { status: 500 }
        )
    }
}
