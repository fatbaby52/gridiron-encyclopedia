import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Create Account',
  alternates: { canonical: '/auth/signup' },
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return <AuthForm mode="signup" />
}
