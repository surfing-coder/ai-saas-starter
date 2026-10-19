"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();

  if (!session) return null;
  const email = session.user.email;
  const initial = email?.[0]?.toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="mr-2 h-4 w-4 dark:hidden" />
          <Moon className="mr-2 hidden h-4 w-4 dark:block" />
          Toggle theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut();
            router.push("/sign-in");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
