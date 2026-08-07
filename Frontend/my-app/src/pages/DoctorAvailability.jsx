import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { DOCTOR_API } from '../api'

const DAYS = [
  { label: 'All Weekdays (Mon-Sat)', value: 'ALL' },
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
  { label: 'Sunday', value: 'SUNDAY' }
]

export default function DoctorAvailability() {
  const { user } = useSelector((state) => state.auth)
  const doctorId = user?.userId || user?.userid

  const [form, setForm] = useState({
    dayOfWeek: 'ALL',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30
  })

  const [schedules, setSchedules] = useState([])
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const fetchSchedules = () => {
    if (!doctorId) return
    fetch(`${DOCTOR_API}/api/doctors/${doctorId}/availability`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchSchedules()
  }, [doctorId])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })

    fetch(`${DOCTOR_API}/api/doctors/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorid: doctorId,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMinutes: parseInt(form.slotDurationMinutes)
      })
    })
      .then(async (res) => {
        const data = await res.json()
        setLoading(false)
        if (res.ok) {
          setMsg({ text: data.message || 'Schedule saved successfully!', type: 'success' })
          fetchSchedules()
        } else {
          setMsg({ text: data.message || 'Failed to save schedule', type: 'danger' })
        }
      })
      .catch(() => {
        setLoading(false)
        setMsg({ text: 'Error connecting to server', type: 'danger' })
      })
  }

  return (
    <div style={{ padding: '8px' }}>
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: 'var(--navy-dark)' }}>Manage Work Schedule & Availability</h3>
        <p className="text-muted small mb-0">Define your consultation working hours and appointment slot durations for patients</p>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type} py-2.5 rounded-3 mb-4`}>
          {msg.text}
        </div>
      )}

      <div className="row g-4">
        {/* ADD / UPDATE SCHEDULE FORM */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 h-100">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--navy-dark)' }}>Set Available Hours</h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Day of Week</label>
                <select
                  className="form-select"
                  name="dayOfWeek"
                  value={form.dayOfWeek}
                  onChange={handleChange}
                  required
                >
                  {DAYS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Slot Duration (Minutes)</label>
                <select
                  className="form-select"
                  name="slotDurationMinutes"
                  value={form.slotDurationMinutes}
                  onChange={handleChange}
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-cyan-gradient w-100 py-2.5 fw-bold"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Schedule'}
              </button>
            </form>
          </div>
        </div>

        {/* ACTIVE SCHEDULES LIST */}
        <div className="col-lg-7">
          <div className="card glass-card p-4 h-100">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--navy-dark)' }}>Active Schedules</h5>

            {schedules.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="fs-1 mb-2">📅</div>
                <p className="mb-0">No custom schedule set yet. Default slots (09:00 AM - 05:00 PM) will be generated.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr className="table-light">
                      <th>Day</th>
                      <th>Working Hours</th>
                      <th>Slot Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s, idx) => (
                      <tr key={s.availabilityId || idx}>
                        <td className="fw-bold text-primary">{s.dayOfWeek}</td>
                        <td>{s.startTime} - {s.endTime}</td>
                        <td>{s.slotDurationMinutes || 30} mins</td>
                        <td>
                          <span className="badge bg-success">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
