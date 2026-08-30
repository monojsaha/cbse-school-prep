"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace(redirect);
    } catch {
      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-slide-up">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4 shadow-md">
          <span className="text-white font-bold text-lg">SF</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
        <p className="text-sm text-neutral-500 mt-1">Sign in to continue learning</p>
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-error-50 border border-error-200 rounded-xl px-3 py-2">
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-1">
            Sign In
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-neutral-500 mt-6">
        New to ScholarForge?{" "}
        <Link href="/signup" className="text-brand-600 font-medium hover:text-brand-700">
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
