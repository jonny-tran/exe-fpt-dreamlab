"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  tripBriefSchema,
  type TripBriefFormValues,
} from "@/lib/schemas/trip-brief.schema";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createTrip } from "@/app/trip/create/actions";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { useState, useEffect } from "react";

interface TripBriefFormProps {
  destinationId: string;
  destinationName: string;
  destinationImage: string | null;
}

export default function TripBriefForm({
  destinationId,
  destinationName,
  destinationImage,
}: TripBriefFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const form = useForm<TripBriefFormValues>({
    resolver: zodResolver(tripBriefSchema),
    defaultValues: {
      title: "",
      participants: 2,
      budget: undefined,
      goals: "",
    },
  });

  // Kiểm tra dữ liệu đã lưu sau khi đăng nhập
  useEffect(() => {
    const checkPendingData = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const savedData = localStorage.getItem("pendingTripData");
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            const payload = {
              values: parsedData,
              destinationId: destinationId,
            };

            const result = await createTrip(payload);
            if (result.success) {
              toast.success("Đã tạo kế hoạch thành công!");
              router.push(`/trip/${result.data.newTripId}/itinerary`);
              localStorage.removeItem("pendingTripData");
            }
          } catch (error) {
            console.error("Error processing saved data:", error);
            localStorage.removeItem("pendingTripData");
          }
        }
      }
    };

    checkPendingData();
  }, [destinationId, router]);

  const onSubmit = async (values: TripBriefFormValues) => {
    try {
      // Khởi tạo Supabase client
      const supabase = createClient();

      // Kiểm tra session (phiên đăng nhập)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Rẽ nhánh logic
      if (!session) {
        // Chưa đăng nhập - lưu dữ liệu form và hiển thị dialog đăng nhập
        console.log(
          "PHÁT HIỆN CHƯA ĐĂNG NHẬP. Lưu dữ liệu form và hiển thị dialog đăng nhập."
        );
        localStorage.setItem("pendingTripData", JSON.stringify(values));
        setShowLoginDialog(true);
        return;
      }

      // Đã đăng nhập - gọi Server Action
      console.log("Đã đăng nhập. Dữ liệu form hợp lệ:", values);
      console.log("Chuẩn bị tạo chuyến đi với destinationId:", destinationId);
      console.log("User ID:", session.user.id);

      // Gọi Server Action trong startTransition
      startTransition(async () => {
        const payload = {
          values: values,
          destinationId: destinationId,
        };

        const result = await createTrip(payload);

        if (result.success) {
          toast.success("Đã tạo kế hoạch thành công!");
          // Điều hướng đến trang itinerary
          router.push(`/trip/${result.data.newTripId}/itinerary`);
        } else {
          toast.error(
            result.error || "Tạo kế hoạch thất bại, vui lòng thử lại."
          );
        }
      });
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form chính */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chuyến đi</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên chuyến đi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Team Building Đà Lạt 2025"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Đặt tên cho chuyến đi của bạn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dates */}
                <FormField
                  control={form.control}
                  name="dates"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Khoảng thời gian</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "dd/MM/yyyy", {
                                      locale: vi,
                                    })}{" "}
                                    -{" "}
                                    {format(field.value.to, "dd/MM/yyyy", {
                                      locale: vi,
                                    })}
                                  </>
                                ) : (
                                  format(field.value.from, "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                )
                              ) : (
                                <span>Chọn ngày bắt đầu và kết thúc</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                            numberOfMonths={2}
                            locale={vi}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Chọn ngày bắt đầu và kết thúc chuyến đi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Participants */}
                <FormField
                  control={form.control}
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng người tham gia</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          min={2}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Tối thiểu 2 người tham gia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000000"
                          min={0}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Ngân sách dự kiến cho chuyến đi (không bắt buộc)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Goals */}
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mục tiêu chuyến đi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ví dụ: Xây dựng tinh thần đồng đội, thư giãn sau kỳ thi..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Mô tả ngắn gọn mục tiêu của chuyến đi (không bắt buộc)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Tạo kế hoạch chuyến đi"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Destination Info */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Điểm đến</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {destinationImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={destinationImage}
                  alt={destinationName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{destinationName}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Hãy điền thông tin chuyến đi của bạn để chúng tôi có thể tạo kế
                hoạch phù hợp nhất.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
            <DialogDescription>
              Bạn cần đăng nhập để tạo kế hoạch chuyến đi. Dữ liệu bạn đã điền
              sẽ được lưu lại.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <GoogleLoginButton />
            <p className="text-sm text-muted-foreground text-center">
              Sau khi đăng nhập, kế hoạch sẽ được tạo tự động với thông tin bạn
              đã điền.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
