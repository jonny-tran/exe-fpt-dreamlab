# Trip Form - Server Action Integration

## Tổng quan

Tài liệu này mô tả việc tích hợp Server Action `createTrip` vào Client Component `TripBriefForm` để xử lý việc tạo chuyến đi mới.

## Các thay đổi đã thực hiện

### 1. Cập nhật Imports trong `trip-brief-form.tsx`

```typescript
// Thêm các imports mới
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createTrip } from "@/app/trip/create/actions";
```

### 2. Khởi tạo Hooks

```typescript
export default function TripBriefForm({ ... }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // ... rest of component
}
```

### 3. Cập nhật hàm `onSubmit`

```typescript
const onSubmit = async (values: TripBriefFormValues) => {
  try {
    // Kiểm tra session (giữ nguyên logic cũ)
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Bạn cần đăng nhập để tiếp tục");
      router.push("/login");
      return;
    }

    // Gọi Server Action trong startTransition
    startTransition(async () => {
      const payload = {
        values: values,
        destinationId: destinationId,
      };

      const result = await createTrip(payload);

      if (result.success) {
        toast.success("Đã tạo kế hoạch thành công!");
        router.push(`/trip/${result.data.newTripId}/itinerary`);
      } else {
        toast.error(result.error || "Tạo kế hoạch thất bại, vui lòng thử lại.");
      }
    });
  } catch (error) {
    console.error("Lỗi khi xử lý form:", error);
    toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
};
```

### 4. Cập nhật Submit Button

```typescript
<Button type="submit" size="lg" className="w-full" disabled={isPending}>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Đang xử lý...
    </>
  ) : (
    "Tạo kế hoạch chuyến đi"
  )}
</Button>
```

### 5. Sửa lỗi trong Server Action

**Vấn đề**: Server Action đang cố gắng insert trường `destination_id` không tồn tại trong database schema.

**Giải pháp**: Loại bỏ trường `destination_id` khỏi `tripData` trong `actions.ts`:

```typescript
// Trước (có lỗi)
const tripData = {
  // ... other fields
  destination_id: destinationId, // ❌ Trường này không tồn tại
  // ... other fields
};

// Sau (đã sửa)
const tripData = {
  // ... other fields
  // ✅ Đã loại bỏ destination_id
  // ... other fields
};
```

## Luồng hoạt động

1. **User điền form** → Validation với Zod schema
2. **User click Submit** → `onSubmit` được gọi
3. **Kiểm tra session** → Redirect đến login nếu chưa đăng nhập
4. **Gọi Server Action** → `createTrip` trong `startTransition`
5. **Server Action xử lý**:
   - Tạo record trong bảng `trips`
   - Generate `itinerary_blocks`
   - Generate `checklist_items`
6. **Xử lý kết quả**:
   - Thành công → Toast success + Redirect đến `/trip/{id}/itinerary`
   - Thất bại → Toast error

## Các tính năng đã implement

- ✅ Form validation với Zod
- ✅ Session checking
- ✅ Loading state với `useTransition`
- ✅ Error handling
- ✅ Success feedback với toast
- ✅ Auto redirect sau khi tạo thành công
- ✅ Database integration với Supabase
- ✅ Type safety với TypeScript

## Lưu ý quan trọng

1. **Database Schema**: Đảm bảo các trường trong `tripData` khớp với database schema
2. **Type Safety**: Sử dụng types từ `@/types/trip-brief` và `@/lib/database.types`
3. **Error Handling**: Luôn có fallback cho các trường hợp lỗi
4. **User Experience**: Hiển thị loading state và feedback rõ ràng

## Testing

Để test tính năng này:

1. Điền form với dữ liệu hợp lệ
2. Click "Tạo kế hoạch chuyến đi"
3. Kiểm tra:
   - Button hiển thị loading state
   - Toast notification xuất hiện
   - Redirect đến trang itinerary
   - Data được lưu trong database
