"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            {/* 404 Animation */}
            <div className="relative">
              <div className="text-8xl font-bold text-primary opacity-20">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Search className="w-8 h-8 text-destructive" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Trang không tìm thấy
              </h1>
              <p className="text-muted-foreground">
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di
                chuyển.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Nếu bạn nghĩ đây là lỗi, vui lòng{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  liên hệ với chúng tôi
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Bạn có thể thử:</p>
          <div className="mt-2 space-x-4">
            <Link href="/" className="text-primary hover:underline text-sm">
              Trang chủ
            </Link>
            <Link
              href="/destinations"
              className="text-primary hover:underline text-sm"
            >
              Điểm đến
            </Link>
            <Link
              href="/about"
              className="text-primary hover:underline text-sm"
            >
              Giới thiệu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
