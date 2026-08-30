import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("sf_session")?.value;

  if (!session) redirect("/login?redirect=/admin");

  try {
    const decoded = await adminAuth.verifyIdToken(session);
    if (decoded.role !== "admin") redirect("/dashboard");
  } catch {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">SF</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-900">ScholarForge Admin</h1>
          <p className="text-xs text-neutral-400">Content Management Portal</p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
