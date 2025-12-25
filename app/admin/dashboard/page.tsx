import { getLogoSettings } from "@/lib/settings"
import { DashboardClient } from "./dashboard-client"

export default async function AdminDashboardPage() {
    const logoSettings = await getLogoSettings()

    return <DashboardClient initialLogoData={logoSettings} />
}
