import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Sign In | ${SITE_NAME}`,
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
