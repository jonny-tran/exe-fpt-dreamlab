"use client";

import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
        return;
      }

      toast.success("Đăng xuất thành công!");
      router.refresh();
    } catch (error) {
      console.error("Unexpected logout error:", error);
      toast.error("Đã có lỗi xảy ra khi đăng xuất.");
    }
  };

  return (
    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Đăng xuất</span>
    </DropdownMenuItem>
  );
}
