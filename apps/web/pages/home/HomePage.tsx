"use-client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Sparkles,
  Users,
  CheckSquare,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import heroImage from "@/assets/hero-landing.jpg";

const HomePage = () => {
  const features = [
    {
      icon: Clock,
      title: "Lập kế hoạch trong 15 phút",
      description:
        "Tạo lịch trình hoàn chỉnh trong vài phút, không phải hàng giờ",
    },
    {
      icon: Sparkles,
      title: "Hoạt động thông minh",
      description:
        "Hơn 60 hoạt động được tuyển chọn với danh sách kiểm tra tự động",
    },
    {
      icon: Users,
      title: "Phân công vai trò",
      description: "Giao nhiệm vụ và giữ mọi người có trách nhiệm",
    },
    {
      icon: CheckSquare,
      title: "Bảng kế hoạch trong ngày",
      description: "Hướng dẫn di động sẵn sàng offline để thực hiện suôn sẻ",
    },
    {
      icon: Calendar,
      title: "Quản lý thời gian biểu",
      description: "Điều chỉnh một chạm khi kế hoạch thay đổi",
    },
    {
      icon: TrendingUp,
      title: "Theo dõi chi phí",
      description: "Chia sẻ đơn giản và quản lý ngân sách",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "var(--gradient-hero)",
          }}
        />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Biến <span className="text-primary">ý tưởng</span> thành những{" "}
                <span className="text-accent">trải nghiệm</span> khó quên
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Lập kế hoạch cho chuyến đi sinh viên, team building và du lịch
                bạn bè trong vòng chưa đầy 15 phút. Nhận lịch trình tức thì,
                danh sách kiểm tra thông minh và bảng kế hoạch trong ngày.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg h-14 px-8">
                  Chọn điểm đến
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8"
                >
                  Xem ví dụ
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">70%</div>
                  <div className="text-sm text-muted-foreground">
                    Kế hoạch hoàn thành
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">
                    15 phút
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Thời gian lập kế hoạch trung bình
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">60+</div>
                  <div className="text-sm text-muted-foreground">Hoạt động</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl"
                style={{ background: "var(--gradient-hero)" }}
              />
              <Image
                src={heroImage}
                alt="Nhóm bạn lập kế hoạch và tận hưởng các hoạt động cùng nhau"
                width={400}
                height={300}
                className="relative rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section - Remove this as we have a dedicated page */}

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Mọi thứ bạn cần để thành công
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Từ bản tóm tắt ban đầu đến tổng kết sau chuyến đi, chúng tôi đã bao
            gồm mọi bước
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 border-2"
              style={{
                background: "var(--gradient-card)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Khoảnh khắc kỳ diệu</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Xem chuyến đi của bạn trở nên sống động trong ba bước đơn giản
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">
                Điền thông tin chuyến đi
              </h3>
              <p className="text-muted-foreground">
                Trả lời một vài câu hỏi nhanh về nhóm, ngày tháng và mục tiêu
                của bạn
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Nhận lịch trình tức thì</h3>
              <p className="text-muted-foreground">
                Nhận kế hoạch có khung thời gian với các hoạt động và danh sách
                kiểm tra
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Thực hiện ngày của bạn</h3>
              <p className="text-muted-foreground">
                Sử dụng bảng kế hoạch di động để quản lý mọi thứ khi di chuyển
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="text-lg h-14 px-8">
              Tạo chuyến đi đầu tiên của bạn
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl font-bold">
            Được tin tưởng bởi các nhà tổ chức ở khắp mọi nơi
          </h2>
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="space-y-2">
              <div className="text-2xl font-bold">Câu lạc bộ sinh viên</div>
              <p className="text-muted-foreground">
                20-50 người tham gia, cần giải pháp trọn gói
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">Trưởng nhóm</div>
              <p className="text-muted-foreground">
                10-40 người, yêu cầu thời gian biểu và an toàn
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">Nhóm bạn</div>
              <p className="text-muted-foreground">
                2-10 bạn, muốn kế hoạch nhanh có ngân sách
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative container mx-auto px-4 text-center space-y-8">
          <h2 className="text-5xl font-bold">
            Sẵn sàng tạo ra điều gì đó tuyệt vời?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tham gia cùng các nhà tổ chức đang biến kế hoạch thành kỷ niệm
          </p>
          <Button size="lg" className="text-lg h-14 px-12">
            Bắt đầu - Miễn phí
          </Button>
          
          {/* Test 404 Link */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Developer: Test 404 page
            </p>
            <Link href="/test-404">
              <Button variant="outline" size="sm">
                Test 404 Error Page
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
