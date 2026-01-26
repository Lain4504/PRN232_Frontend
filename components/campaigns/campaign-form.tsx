"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCampaignSchema, CreateCampaignFormData } from "@/lib/validators/campaign-schemas";
import { CAMPAIGN_OBJECTIVES } from "@/lib/types/campaigns";
import { useBrands } from "@/hooks/use-brands";
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";
import { useGetSocialAccounts, useGetAdAccounts } from "@/hooks/use-social-accounts";
import { AdCampaignResponse } from "@/lib/types/campaigns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronRight, ChevronLeft, Facebook, Instagram, Music2, Globe, Check, Wallet, Calendar, Target, Flag, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CampaignFormProps {
  mode: "create" | "edit";
  campaign?: AdCampaignResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isDrawer?: boolean;
}

export function CampaignForm({
  mode,
  campaign,
  open,
  onOpenChange,
  onSuccess,
  isDrawer = false,
}: CampaignFormProps) {
  const { data: brands = [] } = useBrands();
  const { data: socialAccounts = [] } = useGetSocialAccounts();
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedSocialAccountId, setSelectedSocialAccountId] = React.useState<string>("");

  const { data: adAccounts = [] } = useGetAdAccounts(selectedSocialAccountId);

  const form = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      brandId: campaign?.brandId || "",
      adAccountId: campaign?.adAccountId || "",
      name: campaign?.name || "",
      objective: (campaign?.objective as string) || "",
      budget: campaign?.budget || 0,
      startDate: campaign?.startDate ? format(new Date(campaign.startDate), "yyyy-MM-dd") : "",
      endDate: campaign?.endDate ? format(new Date(campaign.endDate), "yyyy-MM-dd") : "",
    },
  });

  const isLoading = createCampaignMutation.isPending || updateCampaignMutation.isPending;

  const onSubmit = async (data: CreateCampaignFormData) => {
    try {
      if (mode === "create") await createCampaignMutation.mutateAsync(data);
      else if (campaign) await updateCampaignMutation.mutateAsync({ id: campaign.id, ...data });
      toast.success("Chiến dịch đã được lưu!");
      onSuccess?.();
    } catch (error) {
      toast.error("Lỗi khi lưu chiến dịch");
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedSocialAccountId) setCurrentStep(2);
  };

  const handlePrevStep = () => {
    if (currentStep === 2) setCurrentStep(1);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-4">
      {/* Dynamic Progress Indicator */}
      <div className="flex items-center justify-between px-1 mb-8">
        <div className="flex items-center gap-4">
          <div className={cn("size-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors", currentStep === 1 ? "bg-slate-900 text-white" : "bg-emerald-500 text-white")}>
            {currentStep > 1 ? <Check className="size-4" /> : "1"}
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bước 01</p>
            <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">Nguồn dữ liệu</p>
          </div>
        </div>
        <div className="flex-1 h-px bg-slate-100 mx-8" />
        <div className="flex items-center gap-4">
          <div className={cn("size-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors", currentStep === 2 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
            2
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bước 02</p>
            <p className="text-[11px] font-black uppercase tracking-tight text-slate-400">Cấu hình Vận hành</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lựa chọn Tài khoản Quảng cáo</Label>
                <p className="text-xs font-medium text-slate-400 italic">Xác định nền tảng social sẽ thực thi chiến dịch này.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {socialAccounts.map((account) => {
                  const isSelected = selectedSocialAccountId === account.id;
                  const getProviderIcon = (provider: string) => {
                    switch (provider.toLowerCase()) {
                      case 'facebook': return <Facebook className="size-5 fill-blue-600 text-blue-600" />;
                      case 'instagram': return <Instagram className="size-5 text-rose-500" />;
                      case 'tiktok': return <Music2 className="size-5 text-slate-900" />;
                      default: return <Globe className="size-5 text-slate-400" />;
                    }
                  };

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setSelectedSocialAccountId(account.id)}
                      className={cn(
                        "p-6 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center gap-6 text-left relative overflow-hidden group",
                        isSelected
                          ? 'border-slate-900 bg-slate-50 shadow-md'
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      )}
                    >
                      <div className="size-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {getProviderIcon(account.provider)}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 uppercase tracking-tight text-base">{account.provider}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked ID: {account.providerUserId || 'Connected'}</p>
                      </div>
                      {isSelected && (
                        <div className="size-6 rounded-full bg-slate-900 flex items-center justify-center text-white scale-110 animate-in zoom-in duration-300">
                          <Check className="size-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {socialAccounts.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <Flag className="size-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-tighter">Chưa có tài khoản liên kết nào.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400">Định danh Chiến dịch</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên chiến dịch..." {...field} className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus-visible:ring-slate-100 font-black text-slate-900 uppercase tracking-tight shadow-sm" />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400">Thương hiệu đại diện</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 font-black text-slate-900 uppercase tracking-tight">
                            <SelectValue placeholder="Chọn brand..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl p-1 shadow-2xl">
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id} className="rounded-xl h-12 uppercase font-black text-[10px]">{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cổng quảng cáo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 font-black text-slate-900 uppercase tracking-tight">
                            <SelectValue placeholder="Chọn Ad Account..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl p-1 shadow-2xl">
                          {adAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id} className="rounded-xl h-14">
                              <div className="flex flex-col text-left">
                                <span className="font-black text-slate-900 uppercase text-[10px]">{account.name}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{account.accountId} • {account.currency}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="size-3 text-slate-400" />
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mục tiêu Chiến lược</FormLabel>
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-black text-slate-900 uppercase tracking-tight">
                            <SelectValue placeholder="Chọn mục tiêu..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl p-1 shadow-2xl">
                          {CAMPAIGN_OBJECTIVES.map((obj) => (
                            <SelectItem key={obj} value={obj} className="rounded-xl h-11 uppercase font-black text-[10px]">{obj.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="size-3 text-slate-400" />
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ngân sách ngày (VNĐ)</FormLabel>
                      </div>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-black text-slate-900 shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Ngày kích hoạt</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-black text-slate-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-black text-slate-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-100">
            {currentStep === 2 && (
              <Button type="button" variant="outline" onClick={handlePrevStep} className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[11px] flex-1">
                <ChevronLeft className="mr-3 size-5" /> Quay lại
              </Button>
            )}

            {currentStep === 1 ? (
              <Button type="button" onClick={handleNextStep} disabled={!selectedSocialAccountId} className="h-16 flex-[2] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
                Tiếp tục Cấu hình <ChevronRight className="ml-2 size-5" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="h-16 flex-[2] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
                {isLoading ? <Loader2 className="mr-3 size-5 animate-spin" /> : <Check className="mr-3 size-5" />}
                {mode === "create" ? "Xác nhận Khởi tạo" : "Cập nhật Chiến dịch"}
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-16 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[11px] flex-1">Hủy bỏ</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
