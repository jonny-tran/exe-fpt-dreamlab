# Supabase Setup Guide

## Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `apps/web/` với nội dung:

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Supabase Anon Key (public key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Cách lấy các giá trị này:

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào Settings > API
4. Copy Project URL và anon/public key

## Cấu trúc thư mục Supabase:

```
lib/supabase/
├── client.ts      # Cho Client Components
├── server.ts      # Cho Server Components/Actions/Route Handlers
└── middleware.ts  # Cho Middleware authentication
```

## Cách sử dụng:

### Client Components:

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

### Server Components/Actions:

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
```

### Middleware:

Middleware đã được cấu hình để xử lý authentication tự động.

## Lưu ý bảo mật:

- Anon key an toàn để sử dụng trong client-side code
- Không bao giờ commit `.env.local` vào version control
- Đối với production, set các biến này trong deployment platform
