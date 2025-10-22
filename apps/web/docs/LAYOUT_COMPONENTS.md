# Header và Footer Components với MainLayout

## Tổng quan

Đã tạo thành công các component Header, Footer và MainLayout cho toàn bộ ứng dụng Bond Plan. Các component này bao gồm:

- **Header**: Thanh điều hướng với logo, menu và nút đăng nhập/người dùng
- **Footer**: Chân trang với thông tin công ty và liên kết
- **MainLayout**: Layout chính bao gồm Header và Footer
- **AuthContext**: Context để quản lý trạng thái đăng nhập

## Các file đã tạo/cập nhật

### Components
- `apps/web/components/Header.tsx` - Component header với nút đăng nhập và dropdown user
- `apps/web/components/Footer.tsx` - Component footer với thông tin và liên kết
- `apps/web/components/MainLayout.tsx` - Layout chính bao gồm header và footer
- `apps/web/contexts/AuthContext.tsx` - Context quản lý authentication

### Pages
- `apps/web/app/auth/callback/page.tsx` - Trang callback cho OAuth (Google)

### Cập nhật
- `apps/web/app/layout.tsx` - Cập nhật để sử dụng MainLayout và AuthProvider
- `apps/web/components/login-form.tsx` - Cập nhật để sử dụng AuthContext
- `apps/web/pages/home/HomePage.tsx` - Loại bỏ min-h-screen vì MainLayout đã xử lý
- `apps/web/app/destinations/page.tsx` - Loại bỏ main tag vì MainLayout đã có

## Tính năng

### Header
- Logo và tên ứng dụng "Bond Plan"
- Menu điều hướng (Trang chủ, Điểm đến)
- Nút đăng nhập khi chưa đăng nhập
- Dropdown user với avatar, tên, email và các tùy chọn khi đã đăng nhập
- Responsive design

### Footer
- Thông tin công ty với logo
- Liên kết nhanh
- Thông tin hỗ trợ
- Thông tin liên hệ
- Social media links
- Copyright và các liên kết pháp lý

### AuthContext
- Quản lý trạng thái đăng nhập
- Hỗ trợ đăng nhập với email/password
- Hỗ trợ đăng nhập với Google OAuth
- Tự động đồng bộ trạng thái đăng nhập
- Xử lý đăng xuất

## Cách sử dụng

### Sử dụng AuthContext trong component
```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, loading, signIn, signOut, signInWithGoogle } = useAuth();
  
  // Sử dụng các function và state
}
```

### Layout tự động
Tất cả các trang sẽ tự động có Header và Footer thông qua MainLayout được áp dụng trong `app/layout.tsx`.

## Trạng thái hiện tại

✅ **Hoàn thành:**
- Component Header với UI đăng nhập/người dùng
- Component Footer với đầy đủ thông tin
- MainLayout bao gồm Header và Footer
- AuthContext để quản lý authentication
- Cập nhật LoginForm để sử dụng AuthContext
- Trang callback cho OAuth
- Responsive design
- Không có linter errors

🔄 **Cần thực hiện tiếp:**
- Cấu hình Supabase OAuth với Google
- Test chức năng đăng nhập thực tế
- Thêm các trang profile, settings
- Xử lý error handling tốt hơn

## Lưu ý

- Hiện tại AuthContext đã được setup để làm việc với Supabase
- Cần cấu hình Google OAuth trong Supabase dashboard
- Các trang profile và settings cần được tạo để hoàn thiện dropdown menu
- Layout đã được tối ưu cho responsive design
