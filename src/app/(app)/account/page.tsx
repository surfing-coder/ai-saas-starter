import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const plan = (session.user as { plan?: string }).plan ?? "free";

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name: </span>
            {session.user.name}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {session.user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Plan: </span>
            <span className="font-medium capitalize">{plan}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
