"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      router.replace("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else {
        setError("Could not create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4 shadow-md">
          <span className="text-white font-bold text-lg">SF</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Join ScholarForge</h1>
        <p className="text-sm text-neutral-500 mt-1">Your personalised learning journey starts here</p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="aryan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            icon={<Lock size={16} />}
            required
            autoComplete="new-password"
          />

          {error && (
            <div className="bg-error-50 border border-error-200 rounded-xl px-3 py-2">
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-1">
            Create Account
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
