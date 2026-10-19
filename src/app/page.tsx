import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold">AI SaaS Starter</span>
        <nav className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:underline">
            Pricing
          </Link>
          {session ? (
            <>
              <Link href="/chat">
                <Button size="sm">Open app</Button>
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Launch your AI SaaS this weekend.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          A production-ready Next.js starter with authentication, Stripe
          subscriptions, and a streaming AI chat built in. Stop wiring
          boilerplate — start shipping your product.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href={session ? "/chat" : "/sign-up"}>
            <Button size="lg">{session ? "Open the app" : "Start building"}</Button>
          </Link>
          <Link href="/chat">
            <Button size="lg" variant="outline">Try the demo</Button>
          </Link>
        </div>

        <div className="mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
          {[
            ["Auth", "Email + password via Better Auth. Secure sessions out of the box."],
            ["Payments", "Stripe subscriptions + webhooks. Free and Pro plans wired up."],
            ["AI Chat", "Streaming chat with the Vercel AI SDK. Swap any model."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border p-5 text-left">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        Built with Next.js, Better Auth, Drizzle, Stripe & the Vercel AI SDK.
      </footer>
    </div>
  );
}
