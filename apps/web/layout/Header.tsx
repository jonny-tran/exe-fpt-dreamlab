import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-primary-foreground font-bold text-sm">
              BP
            </span>
          </div>
          <span className="font-bold text-xl">Bond Plan</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Trang chủ
          </Link>
          <Link
            href="/destinations"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Điểm đến
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
