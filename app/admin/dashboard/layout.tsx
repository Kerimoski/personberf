import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    // Redirect to login if not authenticated (except for login page)
    if (!session) {
        redirect("/admin/login")
    }

    return <>{children}</>
}
