"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, CheckSquare, Clock } from "lucide-react";

interface TripNavigationProps {
  tripId: string;
}

export function TripNavigation({ tripId }: TripNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/trip/${tripId}/itinerary`,
      label: "Lịch trình",
      icon: Calendar,
      description: "Xem và chỉnh sửa lịch trình chi tiết",
    },
    {
      href: `/trip/${tripId}/checklist`,
      label: "Danh sách công việc",
      icon: CheckSquare,
      description: "Quản lý các công việc cần làm",
    },
    {
      href: `/trip/${tripId}/runsheet`,
      label: "Bảng điều khiển",
      icon: Clock,
      description: "Theo dõi thời gian thực trong ngày diễn ra",
    },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-4 text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
