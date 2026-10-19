import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MessageSquare, CreditCard, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";

const nav = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/account", label: "Account", icon: User },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="flex h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r p-4 sm:flex">
        <Link href="/" className="mb-6 px-2 font-semibold">
          AI SaaS Starter
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-end border-b px-6 py-3">
          <UserMenu />
        </header>
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
