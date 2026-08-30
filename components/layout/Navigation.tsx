"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calculator, Atom, FlaskConical,
  PenLine, BookOpen, BarChart3, User, LogOut, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { Badge } from "@/components/ui/Badge";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Home",       icon: LayoutDashboard },
  { href: "/practice",    label: "Practice",   icon: Calculator },
  { href: "/writing",     label: "Writing",    icon: PenLine },
  { href: "/vocabulary",  label: "Words",      icon: BookOpen },
  { href: "/progress",    label: "Progress",   icon: BarChart3 },
];

const SUBJECT_ITEMS = [
  { href: "/practice/mathematics", label: "Mathematics", icon: Calculator, cls: "text-math-600" },
  { href: "/practice/physics",     label: "Physics",     icon: Atom,        cls: "text-physics-600" },
  { href: "/practice/chemistry",   label: "Chemistry",   icon: FlaskConical,cls: "text-chemistry-600" },
];

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
        "transition-all duration-150",
        active
          ? "bg-brand-50 text-brand-700"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
      )}
    >
      <Icon size={18} className="shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

// Mobile bottom nav item
function MobileNavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 flex-1 py-2",
        "transition-colors duration-150",
        active ? "text-brand-600" : "text-neutral-400 hover:text-neutral-600"
      )}
    >
      <Icon size={22} />
      <span className="text-2xs font-medium">{label}</span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const streak = profile?.currentStreak ?? 0;
  const xp = profile?.xpTotal ?? 0;

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-neutral-200 bg-white min-h-screen sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <div>
              <p className="font-bold text-neutral-900 leading-none">ScholarForge</p>
              <p className="text-2xs text-neutral-400 mt-0.5">Learn. Solve. Write. Grow.</p>
            </div>
          </div>
        </div>

        {/* Student info */}
        {profile && (
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
            <p className="text-sm font-semibold text-neutral-800 truncate">{profile.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Flame size={13} className="text-orange-500" />
              <span className="text-2xs text-neutral-500">{streak} day streak</span>
              <span className="text-2xs text-neutral-300">·</span>
              <span className="text-2xs text-xp-500 font-semibold">{xp.toLocaleString()} XP</span>
            </div>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={pathname === href || (href !== "/dashboard" && pathname.startsWith(href))}
            />
          ))}

          <div className="mt-4 mb-2 px-3">
            <p className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider">Subjects</p>
          </div>
          {SUBJECT_ITEMS.map(({ href, label, icon: Icon, cls }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
                "transition-colors duration-150",
                pathname.startsWith(href)
                  ? "bg-neutral-100 font-medium text-neutral-800"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              )}
            >
              <Icon size={16} className={cn("shrink-0", cls)} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-neutral-100 flex flex-col gap-0.5">
          <NavLink href="/profile" label="Profile" Icon={User} active={pathname === "/profile"} />
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Bar ────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 flex pb-safe">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <MobileNavItem
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname === href || (href !== "/dashboard" && pathname.startsWith(href))}
          />
        ))}
      </nav>
    </>
  );
}
