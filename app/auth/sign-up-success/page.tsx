import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Đăng ký thành công!
              </CardTitle>
              <CardDescription>Vui lòng kiểm tra email để xác nhận tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bạn đã đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản trước khi đăng nhập.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
