import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isPro, FREE_DAILY_MESSAGE_LIMIT } from "@/lib/plans";
import { BillingActions } from "@/components/billing-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const plan = (session.user as { plan?: string }).plan ?? "free";
  const pro = isPro(plan);

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Billing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium capitalize">{plan}</p>
          <p className="text-sm text-muted-foreground">
            {pro
              ? "Unlimited AI messages. Thanks for being Pro."
              : `Free plan — up to ${FREE_DAILY_MESSAGE_LIMIT} messages per day. Upgrade for unlimited.`}
          </p>
          <BillingActions pro={pro} />
        </CardContent>
      </Card>
    </div>
  );
}
