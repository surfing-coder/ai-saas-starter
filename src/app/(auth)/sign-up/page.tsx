"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await authClient.signUp.email({ email, password, name });
    if (error) return setError(error.message ?? "Sign up failed");
    router.push("/chat");
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-24 max-w-sm space-y-4 px-4">
      <h1 className="text-2xl font-bold">Create account</h1>
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full">Sign up</Button>
      <p className="text-center text-sm text-muted-foreground">
        Have an account? <Link href="/sign-in" className="underline">Sign in</Link>
      </p>
    </form>
  );
}
