import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type { Product, CreateProductForm, CreateProductRequest } from '@/lib/types/aisam-types'

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  listByBrand: (brandId: string) => [...productKeys.lists(), 'brand', brandId] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
}

// Get all products (simple list)
export function useProducts(brandId?: string) {
  return useQuery({
    queryKey: brandId ? productKeys.listByBrand(brandId) : productKeys.lists(),
    queryFn: async (): Promise<Product[]> => {
      try {
        const url = brandId ? `${endpoints.products()}?brandId=${brandId}` : endpoints.products()
        const resp = await api.get<PaginatedResponse<Product>>(url)
        
        // API trả về paginated response, cần lấy data.data
        return resp.data.data || []
      } catch (error) {
        console.error('Error fetching products:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Get products with pagination
export function useProductsPaginated(params?: {
  brandId?: string
  page?: number
  pageSize?: number
  searchTerm?: string
  sortBy?: string
  sortDescending?: boolean
}) {
  const queryParams = new URLSearchParams()
  
  if (params?.brandId) queryParams.append('brandId', params.brandId)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
  if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString())

  const queryString = queryParams.toString()
  const url = queryString ? `${endpoints.products()}?${queryString}` : endpoints.products()

  return useQuery({
    queryKey: ['products', 'paginated', params],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      const resp = await api.get<PaginatedResponse<Product>>(url)
      return resp.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get product by ID
export function useProduct(productId?: string) {
  return useQuery({
    queryKey: productId ? productKeys.detail(productId) : productKeys.details(),
    queryFn: async (): Promise<Product> => {
      const resp = await api.get<Product>(endpoints.productById(productId!))
      return resp.data
    },
    enabled: !!productId,
    retry: (count, err) => {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) return false
      return count < 2
    },
  })
}

// Create product
export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProductForm): Promise<Product> => {
      // Convert to FormData as required by the API
      const formData = new FormData()
      
      // Required fields according to swagger
      formData.append('BrandId', payload.brand_id)
      formData.append('Name', payload.name)
      
      // Optional fields
      if (payload.description) {
        formData.append('Description', payload.description)
      }
      if (payload.price !== undefined) {
        formData.append('Price', payload.price.toString())
      }
      
      // Image files (required according to swagger)
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file) => {
          formData.append('ImageFiles', file)
        })
      } else {
        // If no images provided, we need to handle this case
        // The API requires ImageFiles, so we might need to create an empty file or handle this differently
        throw new Error('At least one image is required')
      }

      const resp = await api.postMultipart<Product>(endpoints.createProduct(), formData)
      return resp.data
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      if (created.brandId) {
        qc.invalidateQueries({ queryKey: productKeys.listByBrand(created.brandId) })
      }
    },
  })
}

// Update product
export function useUpdateProduct(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProductForm): Promise<Product> => {
      // Convert to FormData for multipart upload
      const formData = new FormData()
      
      formData.append('BrandId', payload.brand_id)
      formData.append('Name', payload.name)
      
      if (payload.description) {
        formData.append('Description', payload.description)
      }
      if (payload.price !== undefined) {
        formData.append('Price', payload.price.toString())
      }
      
      // Add image files if provided
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file) => {
          formData.append('ImageFiles', file)
        })
      }

      // Use putMultipart method (we need to add this to the API)
      const resp = await api.putMultipart<Product>(endpoints.updateProduct(productId), formData)
      return resp.data
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: productKeys.detail(productId) })
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      if (updated.brandId) {
        qc.invalidateQueries({ queryKey: productKeys.listByBrand(updated.brandId) })
      }
    },
  })
}

// Delete product
export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.deleteProduct(productId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// Restore product
export function useRestoreProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.restoreProduct(productId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}