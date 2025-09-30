"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"

interface LayoutWrapperProps {
    children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname()

    // Không hiển thị header cho các trang dashboard, login
    const shouldShowHeader =
        !pathname.startsWith('/dashboard') &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/organizations')

    return (
        <>
            {shouldShowHeader && <Header />}
            {children}
        </>
    )
}