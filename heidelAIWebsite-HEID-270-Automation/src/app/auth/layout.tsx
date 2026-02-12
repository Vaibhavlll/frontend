'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
