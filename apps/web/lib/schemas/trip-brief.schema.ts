import { z } from "zod";

export const tripBriefSchema = z.object({
  title: z
    .string()
    .min(3, "Tên chuyến đi phải có ít nhất 3 ký tự")
    .max(100, "Tên chuyến đi không được quá 100 ký tự"),
  dates: z.object({
    from: z.date({ error: "Vui lòng chọn ngày bắt đầu" }),
    to: z.date({ error: "Vui lòng chọn ngày kết thúc" }),
  }),
  participants: z
    .number({
      error: "Vui lòng nhập số lượng người tham gia",
    })
    .min(2, "Cần ít nhất 2 người tham gia")
    .max(100, "Số lượng người tham gia không được quá 100"),
  budget: z
    .number({
      error: "Ngân sách phải là số",
    })
    .min(0, "Ngân sách không thể âm")
    .optional(),
  goals: z.string().max(500, "Mục tiêu không được quá 500 ký tự").optional(),
});

export type TripBriefFormValues = z.infer<typeof tripBriefSchema>;
