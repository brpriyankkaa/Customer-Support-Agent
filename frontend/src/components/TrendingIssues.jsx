import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { fetchTrendingIssues } from '../services/api.js'

const POLL_INTERVAL_MS = 10000

export default function TrendingIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTrendingIssues()
        setIssues(data || [])
      } catch (err) {
        console.error('Failed to load trending issues:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  if (loading && issues.length === 0) {
    return (
      <div className="border border-capgemini-border bg-white px-6 py-5">
        <p className="text-sm text-slate-500">Loading proactive alerts...</p>
      </div>
    )
  }

  if (issues.length === 0) {
    return null
  }

  return (
    <div className="border border-capgemini-border bg-white">
      <div className="px-6 py-4 border-b border-capgemini-border bg-amber-50">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Proactive Alerts — Trending Issues
          </h2>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Known recurring issues detected across users. Check before creating a duplicate ticket.
        </p>
      </div>
      <div className="divide-y divide-capgemini-border">
        {issues.map((issue, index) => (
          <div
            key={`${issue.issue}-${index}`}
            className={`px-6 py-4 ${issue.severity === 'HIGH' ? 'bg-red-50/50' : ''}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-amber-500 font-bold text-sm mt-0.5">⚠</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Trending Issue: {issue.issue}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Occurrences: {issue.occurrences} Users</span>
                  <span
                    className={`font-semibold ${
                      issue.severity === 'HIGH' ? 'text-red-600' : 'text-slate-600'
                    }`}
                  >
                    Severity: {issue.severity}
                  </span>
                  <span>Status: {issue.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
