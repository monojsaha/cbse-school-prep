"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth/context";
import { Navigation } from "@/components/layout/Navigation";
import { PageLoader } from "@/components/ui/Spinner";

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Navigation />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
