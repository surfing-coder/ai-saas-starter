"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BillingActions({ pro }: { pro: boolean }) {
  const go = async (path: string) => {
    const res = await fetch(path, { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else if (res.status === 401) {
      window.location.href = "/sign-in";
    } else {
      toast.error("Something went wrong. Check your Stripe config.");
    }
  };

  return pro ? (
    <Button onClick={() => go("/api/stripe/portal")}>Manage subscription</Button>
  ) : (
    <Button onClick={() => go("/api/stripe/checkout")}>Upgrade to Pro</Button>
  );
}
