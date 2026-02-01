import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Create Account | ${SITE_NAME}`,
}

export default function SignupPage() {
  return <AuthForm mode="signup" />
}
