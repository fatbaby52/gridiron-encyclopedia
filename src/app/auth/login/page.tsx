import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Sign In',
  alternates: { canonical: '/auth/login' },
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
