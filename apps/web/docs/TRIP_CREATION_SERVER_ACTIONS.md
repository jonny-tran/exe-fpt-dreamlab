# Server Actions - Trip Creation

## Tổng quan

File `apps/web/app/trip/create/actions.ts` chứa Server Action để tạo chuyến đi mới và tự động generate lịch trình cơ bản cùng với checklist mặc định.

## Cấu trúc

### 1. Hàm chính: `createTrip`

```typescript
export async function createTrip(
  payload: CreateTripPayload
): Promise<ActionResponse>;
```

**Tham số:**

- `payload.values`: Dữ liệu form đã được Zod validate
- `payload.destinationId`: ID của điểm đến

**Trả về:**

- `{ success: true, data: { newTripId: string } }` - Thành công
- `{ success: false, error: string }` - Thất bại

### 2. Quy trình xử lý

#### Bước 1: Xác thực người dùng

- Kiểm tra session user từ Supabase Auth
- Trả về lỗi nếu không có user đăng nhập

#### Bước 2: Tạo trip chính

- Insert dữ liệu vào bảng `trips`
- Lấy `id` của trip mới tạo
- Rollback nếu có lỗi

#### Bước 3: Generate itinerary blocks

- Tính số ngày: `differenceInDays(endDate, startDate) + 1`
- Tạo 3 blocks cho mỗi ngày:
  - **Day Header**: Tiêu đề ngày với format "Ngày X (dd/MM/yyyy)"
  - **Main Activity**: Hoạt động chính (có rule đặc biệt cho ngày đầu/cuối)
  - **Free Time**: Thời gian tự do
- Insert vào bảng `itinerary_blocks`

#### Bước 4: Generate checklist items

- Tạo 5-6 items mặc định:
  - Đặt phương tiện di chuyển
  - Đặt chỗ ở
  - Chuẩn bị đồ dùng cá nhân
  - Kiểm tra thời tiết
  - Chuẩn bị tiền mặt
  - Phân công nhiệm vụ (nếu > 2 người)
- Insert vào bảng `checklist_items`

#### Bước 5: Hoàn tất

- Revalidate cache cho `/dashboard` và `/trip`
- Trả về `newTripId`

## Rules-Based Generation

### Itinerary Blocks

**Ngày đầu tiên:**

- Check-in & Ổn định
- Thời gian tự do

**Ngày cuối:**

- Check-out & Di chuyển về
- Thời gian tự do

**Ngày giữa:**

- Hoạt động chính
- Thời gian tự do

### Checklist Items

**Cơ bản (luôn có):**

- Đặt phương tiện di chuyển
- Đặt chỗ ở
- Chuẩn bị đồ dùng cá nhân
- Kiểm tra thời tiết
- Chuẩn bị tiền mặt

**Điều kiện:**

- Phân công nhiệm vụ: Chỉ khi `participants > 2`

## Error Handling

### Rollback Strategy

- Nếu tạo itinerary blocks thất bại → Xóa trip đã tạo
- Nếu tạo checklist items thất bại → Không rollback (non-critical)

### Error Messages

- `"Bạn phải đăng nhập để tạo chuyến đi."` - Không có user
- `"Không thể tạo chuyến đi. Vui lòng thử lại."` - Lỗi tạo trip
- `"Không thể tạo lịch trình. Vui lòng thử lại."` - Lỗi tạo blocks
- `"Lỗi khi tạo danh sách công việc."` - Lỗi tạo checklist

## Dependencies

### Packages

- `date-fns`: Tính toán ngày tháng
- `zod`: Validation schema
- `@supabase/supabase-js`: Database client

### Files

- `@/lib/supabase/server`: Supabase client
- `@/lib/database.types`: Database types
- `@/types/trip-brief`: Type definitions
- `@/lib/schemas/trip-brief.schema`: Zod schema

## Usage Example

```typescript
import { createTrip } from "@/app/trip/create/actions";
import { tripBriefSchema } from "@/lib/schemas/trip-brief.schema";

// Client-side usage
const handleSubmit = async (formData: FormData) => {
  const values = tripBriefSchema.parse({
    title: formData.get("title"),
    dates: {
      from: new Date(formData.get("startDate")),
      to: new Date(formData.get("endDate")),
    },
    participants: Number(formData.get("participants")),
    budget: formData.get("budget") ? Number(formData.get("budget")) : undefined,
    goals: formData.get("goals"),
  });

  const result = await createTrip({
    values,
    destinationId: "destination-uuid",
  });

  if (result.success) {
    router.push(`/trip/${result.data.newTripId}`);
  } else {
    setError(result.error);
  }
};
```

## Database Schema Requirements

### Tables Used

- `trips`: Chuyến đi chính
- `itinerary_blocks`: Các khối lịch trình
- `checklist_items`: Danh sách công việc
- `destinations`: Điểm đến (để link với trips)

### Required Columns

- `trips`: `title`, `start_date`, `end_date`, `participant_count`, `budget_level`, `description`, `destination_id`, `creator_id`, `status`
- `itinerary_blocks`: `trip_id`, `title`, `block_order`, `start_time`, `end_time`, `notes`
- `checklist_items`: `trip_id`, `title`, `description`, `item_order`, `assignee_role`

### Migration Required

Nếu bạn chưa có cột `destination_id` trong bảng `trips`, hãy chạy migration:

```sql
-- File: supabase/migrations/20250123000000_add_destination_id_to_trips.sql
ALTER TABLE public.trips
ADD COLUMN destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL;

CREATE INDEX idx_trips_destination_id ON public.trips(destination_id);
```

## Performance Considerations

- Sử dụng transaction để đảm bảo data consistency
- Batch insert cho itinerary blocks và checklist items
- Revalidate cache chỉ các trang cần thiết
- Error logging để debug

## Future Enhancements

1. **AI Integration**: Sử dụng AI để suggest activities dựa trên destination
2. **Template System**: Cho phép user chọn template có sẵn
3. **Collaborative Planning**: Multiple users có thể edit cùng lúc
4. **Smart Scheduling**: Tự động optimize thời gian dựa trên location
5. **Integration APIs**: Kết nối với booking services
