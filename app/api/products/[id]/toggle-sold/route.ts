import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
        const { isSold } = body

        const product = await db.product.update({
            where: { id },
            data: { isSold }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error toggling sold status:", error)
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        )
    }
}
