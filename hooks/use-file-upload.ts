import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CREATIVE_FILE_LIMITS } from '@/lib/types/creatives';

export interface FileUploadState {
  file: File | null;
  progress: number;
  isUploading: boolean;
  error: string | null;
  preview: string | null;
}

export interface UseFileUploadOptions {
  maxSize?: number;
  acceptedFormats?: string[];
  onSuccess?: (file: File) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [state, setState] = useState<FileUploadState>({
    file: null,
    progress: 0,
    isUploading: false,
    error: null,
    preview: null,
  });

  const validateFile = useCallback((file: File, type: 'IMAGE' | 'VIDEO' | 'GIF' | 'CAROUSEL' | 'STORY') => {
    const limits = CREATIVE_FILE_LIMITS[type];
    
    if (file.size > limits.maxSize) {
      return `File size must be less than ${Math.round(limits.maxSize / (1024 * 1024))}MB`;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !limits.formats.includes(extension)) {
      return `File must be one of: ${limits.formats.join(', ')}`;
    }
    
    return null;
  }, []);

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const uploadFile = useCallback(async (file: File, type: 'IMAGE' | 'VIDEO' | 'GIF' | 'CAROUSEL' | 'STORY') => {
    setState(prev => ({ ...prev, isUploading: true, error: null, progress: 0 }));

    try {
      // Validate file
      const validationError = validateFile(file, type);
      if (validationError) {
        throw new Error(validationError);
      }

      // Create preview
      const preview = await createPreview(file);
      
      setState(prev => ({ 
        ...prev, 
        file, 
        preview,
        progress: 100,
        isUploading: false 
      }));

      options.onSuccess?.(file);
      toast.success('File uploaded successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isUploading: false 
      }));
      
      options.onError?.(errorMessage);
      toast.error(errorMessage);
    }
  }, [validateFile, createPreview, options]);

  const removeFile = useCallback(() => {
    setState({
      file: null,
      progress: 0,
      isUploading: false,
      error: null,
      preview: null,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      file: null,
      progress: 0,
      isUploading: false,
      error: null,
      preview: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    removeFile,
    reset,
  };
}
