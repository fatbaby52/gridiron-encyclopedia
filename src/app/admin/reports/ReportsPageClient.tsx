'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { ReportItem } from '@/components/admin/ReportItem'
import type { ModerationReport } from '@/types/community'

export function ReportsPageClient() {
  const router = useRouter()
  const { user, initialized: authInit } = useAuthStore()
  const { profile } = useProfileStore()
  const [reports, setReports] = useState<ModerationReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authInit && (!user || (profile && profile.role !== 'editor' && profile.role !== 'admin'))) {
      router.push('/')
    }
  }, [authInit, user, profile, router])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/moderation/reports?status=pending')
        if (res.ok) {
          const json = await res.json()
          setReports(json.data ?? [])
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    if (user && profile && (profile.role === 'editor' || profile.role === 'admin')) {
      load()
    }
  }, [user, profile])

  const handleResolve = async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`/api/moderation/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id))
      }
    } catch {
      // silent fail
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderation Reports</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Moderation Reports</h1>
      <p className="text-sm text-gray-500 mb-6">
        Review and resolve content reports submitted by the community.
      </p>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">No pending reports. All clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportItem key={report.id} report={report} onResolve={handleResolve} />
          ))}
        </div>
      )}
    </div>
  )
}
