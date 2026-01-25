import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/pages/forgot-password/forgot-password-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Khôi phục mật khẩu | omniadly",
  description: "Bắt đầu quy trình khôi phục mật khẩu cho tài khoản omniadly của bạn.",
};

export default function Page() {
  return (
    <AuthSplitLayout
      title="Khôi phục truy cập"
      subtitle="Nhập email của bạn để nhận hướng dẫn khôi phục"
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
