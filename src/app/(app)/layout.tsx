import { AppHeader } from "@/components/app/app-header";
import { BottomNav } from "@/components/app/nav-items";
import { SessionRefresher } from "@/components/auth/session-refresher";
import { PushBridge } from "@/components/push/push-bridge";

export default function AuthenticatedLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <SessionRefresher />
      <PushBridge role="owner" />
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 overflow-x-clip px-4 pt-6 pb-28 sm:px-6 md:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
