import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { APPOINTMENT_API } from '../api'

export default function DoctorFeedback() {
  const { user } = useSelector((state) => state.auth)
  const [feedback, setFeedback] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const docId = user?.userId || user?.userid
    if (!docId) return

    fetch(`${APPOINTMENT_API}/feedback/doctor/${docId}`)
      .then(resp => resp.json())
      .then(data => {
        setLoading(false)
        if (!Array.isArray(data) || data.length === 0) {
          setMsg('No feedback received yet.')
        }
        setFeedback(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setLoading(false)
        setMsg('Could not fetch feedback.')
      })
  }, [user])

  const average = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length)
    : 0

  return (
    <div style={{ minHeight: '100vh', padding: '8px' }}>

      {/* HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--navy-dark)' }}>Patient Feedback & Ratings</h3>
          <p className="text-muted small mb-0">See what patients are saying about their consultations with you</p>
        </div>
        {feedback.length > 0 && (
          <span className="badge badge-status badge-completed fs-6">
            ⭐ {average.toFixed(1)} average &bull; {feedback.length} review{feedback.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading && <div className="alert alert-info py-2.5 rounded-3">Loading feedback...</div>}
      {!loading && msg && (
        <div className="card glass-card p-5 text-center">
          <p className="text-muted mb-0">{msg}</p>
        </div>
      )}

      <div className="row g-4">
        {feedback.map(f => (
          <div className="col-md-6" key={f.feedbackId}>
            <div className="card glass-card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold" style={{ color: 'var(--navy-dark)' }}>
                    {'⭐'.repeat(f.rating || 0)}{'☆'.repeat(5 - (f.rating || 0))}
                  </span>
                  <span className="badge badge-status badge-completed">{f.rating}/5</span>
                </div>
                <p className="text-muted mb-0">
                  {f.comments && f.comments.trim() !== '' ? f.comments : <em>No written comment left.</em>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
