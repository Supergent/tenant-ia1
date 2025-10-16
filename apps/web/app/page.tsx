import dynamic from "next/dynamic";

const AuthGate = dynamic(() => import("@/components/auth-gate").then(mod => mod.AuthGate), { ssr: false });
const AppHeader = dynamic(() => import("@/components/app-header").then(mod => mod.AppHeader), { ssr: false });
const DashboardHero = dynamic(() => import("@/components/dashboard-hero").then(mod => mod.DashboardHero), { ssr: false });
const TaskManager = dynamic(() => import("@/components/task-manager").then(mod => mod.TaskManager), { ssr: false });

export default function Page() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
          <DashboardHero />
          <TaskManager />
        </main>
      </div>
    </AuthGate>
  );
}
