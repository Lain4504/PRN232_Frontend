import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { UpdatePasswordFormData } from '@/lib/types/auth'

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: UpdatePasswordFormData): Promise<void> => {
      const response = await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update password');
      }
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update password');
    },
  })
}
