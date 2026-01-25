import type { Metadata } from "next";
import { LoginForm } from "@/components/pages/login/login-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Đăng nhập | omniadly",
  description: "Đăng nhập vào tài khoản omniadly của bạn để quản lý quảng cáo AI",
};

export default function Page() {
  return (
    <AuthSplitLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để quản lý các chiến dịch quảng cáo AI của bạn"
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
