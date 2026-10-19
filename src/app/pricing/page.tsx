"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Pricing() {
  const upgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else if (res.status === 401) {
      window.location.href = "/sign-in";
    } else {
      toast.error("Could not start checkout. Check your Stripe config.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="mb-10 text-center text-3xl font-bold">Pricing</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">$0</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Basic AI chat</li>
              <li>Limited messages</li>
            </ul>
            <Button variant="outline" className="w-full" disabled>
              Current plan
            </Button>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">
              $19<span className="text-base font-normal">/mo</span>
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Unlimited AI chat</li>
              <li>Priority models</li>
              <li>Chat history</li>
            </ul>
            <Button className="w-full" onClick={upgrade}>
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
