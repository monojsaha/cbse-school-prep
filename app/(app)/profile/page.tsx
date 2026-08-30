"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { upsertProfile } from "@/lib/firebase/firestore";
import {} from "@/lib/utils";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";

export default function ProfilePage() {
  const { profile, loading, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(profile?.name ?? "");
  const [school, setSchool]   = useState(profile?.school ?? "");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  if (loading || !profile) return <PageLoader />;

  const xp = profile.xpTotal ?? 0;

  const handleSave = async () => {
    setSaving(true);
    await upsertProfile(profile.id, { name: name.trim(), school: school.trim() });
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-5">
      <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>

      {/* Avatar + identity */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-900">{profile.name}</p>
            <p className="text-sm text-neutral-500">{profile.school ?? "No school set"}</p>
          </div>
        </div>

        {!editing ? (
          <Button variant="secondary" size="sm" onClick={() => { setEditing(true); setName(profile.name ?? ""); setSchool(profile.school ?? ""); }}>
            Edit Profile
          </Button>
        ) : (
          <div className="space-y-3">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="School" value={school} onChange={(e) => setSchool(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={handleSave} loading={saving} size="sm">Save</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
            {saved && <p className="text-xs text-success-600 font-medium">Profile saved!</p>}
          </div>
        )}
      </div>

      {/* XP */}
      <XPBar xp={xp} />

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total XP",       value: xp.toLocaleString() },
            { label: "Current Streak", value: `${profile.currentStreak ?? 0} days`, extra: <StreakBadge streak={profile.currentStreak ?? 0} compact /> },
            { label: "Best Streak",    value: `${profile.longestStreak ?? 0} days` },
            { label: "Board",          value: profile.boardId ?? "—" },
            { label: "Class",          value: profile.classId ? `Class ${profile.classId}` : "—" },
            { label: "Daily Goal",     value: profile.dailyStudyMinutes ? `${profile.dailyStudyMinutes} min` : "—" },
          ].map(({ label, value, extra }) => (
            <div key={label} className="bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-100">
              <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-neutral-800">{value}</p>
                {extra}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
