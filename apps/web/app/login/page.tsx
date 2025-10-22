import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next;
  const error = params.error;

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        {next && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Bạn cần đăng nhập để tiếp tục truy cập trang này.
            </p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
