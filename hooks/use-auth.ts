import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: UpdatePasswordData): Promise<void> => {
      const supabase = createClient()
      
      // First, verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: data.currentPassword,
      })
      
      if (signInError) {
        throw new Error('Current password is incorrect')
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })
      
      if (updateError) {
        throw new Error(updateError.message)
      }
    },
    onSuccess: () => {
      toast.success('Password updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update password')
    },
  })
}
