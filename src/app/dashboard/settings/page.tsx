import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleSettings } from "./schedule-settings";
import { ProfileSettings } from "./profile-settings";

export default async function SettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        redirect("/dashboard/onboarding");
    }

    // Get work schedules
    const { data: workSchedules } = await supabase
        .from("work_schedules")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("day_of_week");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Настройки</h1>
                <p className="text-muted-foreground mt-2">
                    Управляйте настройками вашего профиля и бизнеса
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Профиль</TabsTrigger>
                    <TabsTrigger value="schedule">Рабочий график</TabsTrigger>
                    <TabsTrigger value="ai">AI настройки</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSettings vendor={vendor} />
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                    <ScheduleSettings
                        vendorId={vendor.id}
                        initialSchedules={workSchedules || []}
                    />
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            AI Personality
                        </h3>
                        <p className="text-muted-foreground">
                            🚧 Скоро будет доступно
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
