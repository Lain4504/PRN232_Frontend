import type { Metadata } from "next";
import { SignUpForm } from "@/components/pages/sign-up/sign-up-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Đăng ký | omniadly",
  description: "Tạo tài khoản omniadly mới và bắt đầu tối ưu hóa quảng cáo cùng AI",
};

export default function Page() {
  return (
    <AuthSplitLayout
      title="Tạo tài khoản mới"
      subtitle="Bắt đầu dùng thử miễn phí 14 ngày ngay hôm nay"
    >
      <SignUpForm />
    </AuthSplitLayout>
  );
}
