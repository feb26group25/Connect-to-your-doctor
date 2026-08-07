import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DOCTOR_API, APPOINTMENT_API } from '../api'

export default function BookAppointment() {
  const { state } = useLocation()
  const doctor = state?.doctor
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    appointmentdate: '',
    appointmenttime: '',
    reason: ''
  })

  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })

  const docId = doctor?.doctorId || doctor?.doctorid

  const fetchSlots = () => {
    if (!form.appointmentdate || !docId) return
    setLoadingSlots(true)
    setSlotsError('')

    fetch(`${DOCTOR_API}/api/doctors/${docId}/slots?date=${form.appointmentdate}`)
      .then(async (res) => {
        const data = await res.json()
        setLoadingSlots(false)
        if (res.ok) {
          setAvailableSlots(data.availableSlots || [])
          setBookedSlots(data.bookedSlots || [])
          if ((data.availableSlots || []).length === 0 && (data.bookedSlots || []).length === 0) {
            setSlotsError('No time slots configured for this date. Please try another date.')
          }
        } else {
          setSlotsError(data.message || 'Could not fetch available slots')
        }
      })
      .catch(() => {
        setLoadingSlots(false)
        setSlotsError('Error fetching slots from server')
      })
  }

  useEffect(() => {
    setAvailableSlots([])
    setBookedSlots([])
    setForm(prev => ({ ...prev, appointmenttime: '' }))
    fetchSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.appointmentdate, docId])

  // Full grid shown to the patient: every slot the doctor offers that day,
  // available or already taken - taken ones render greyed out and disabled,
  // the same way a movie-ticket site shows sold seats instead of hiding them.
  const allSlots = [...new Set([...availableSlots, ...bookedSlots])].sort()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelectSlot = (slot) => {
    setForm({ ...form, appointmenttime: slot })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.appointmenttime) {
      setMsg({ text: 'Please select an available time slot.', type: 'warning' })
      return
    }

    setMsg({ text: '', type: '' })
    fetch(`${APPOINTMENT_API}/appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientid: user?.userId || user?.userid,
        doctorid: docId,
        appointmentdate: form.appointmentdate,
        appointmenttime: form.appointmenttime,
        reason: form.reason
      })
    })
      .then(async (resp) => {
        const data = await resp.json()
        if (resp.status === 200) {
          setMsg({ text: data.message || 'Appointment booked successfully!', type: 'success' })
          setTimeout(() => navigate('/user-dashboard/myappointments'), 1500)
        } else {
          setMsg({ text: data.message || 'Booking failed. Try again.', type: 'danger' })
          // Refresh slots if double booking occurred - another patient may
          // have taken this slot between when the page loaded and now.
          setForm(prev => ({ ...prev, appointmenttime: '' }))
          fetchSlots()
        }
      })
      .catch(() => {
        setMsg({ text: 'Network error. Please try again.', type: 'danger' })
      })
  }

  const doctorDisplayName = doctor?.doctorName || `Dr. ${doctor?.firstname || ''} ${doctor?.lastname || ''}`.trim()
  const hospitalDisplayName = doctor?.hospital?.hospitalName || doctor?.hospitalname || 'City General Hospital'

  // Format time (e.g. "09:00" -> "09:00 AM")
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    let hour = parseInt(parts[0], 10)
    const minute = parts[1] || '00'
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
    const formattedHour = hour < 10 ? `0${hour}` : hour
    return `${formattedHour}:${minute} ${ampm}`
  }

  // Minimum date = today
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '8px' }}>
      <button className="btn btn-outline-secondary btn-sm mb-3 rounded-pill px-3"
        onClick={() => navigate('/user-dashboard/search')}>
        ← Back to Search
      </button>

      <div className="card glass-card p-4">
        <h4 className="fw-bold mb-3" style={{ color: 'var(--navy-dark)' }}>Book Consultation</h4>

        {doctor && (
          <div className="alert alert-info py-2.5 rounded-3 mb-4 d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold fs-5">{doctorDisplayName}</div>
              <div className="small text-muted">{doctor.specialization} &bull; {hospitalDisplayName}</div>
            </div>
            <span className="badge bg-primary fs-6">
              &#8377;{doctor.consultationFee ? doctor.consultationFee : '600'}
            </span>
          </div>
        )}

        {msg.text && (
          <div className={`alert alert-${msg.type} py-2.5 rounded-3 mb-3`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* DATE SELECTOR */}
          <div className="mb-3">
            <label className="form-label fw-semibold">1. Select Appointment Date</label>
            <input
              type="date"
              className="form-control"
              name="appointmentdate"
              min={todayStr}
              value={form.appointmentdate}
              onChange={handleChange}
              required
            />
          </div>

          {/* TIME SLOTS SECTION */}
          {form.appointmentdate && (
            <div className="mb-4">
              <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
                <span>2. Select Available Time Slot</span>
                {loadingSlots && <span className="spinner-border spinner-border-sm text-primary" role="status"></span>}
              </label>

              {!loadingSlots && allSlots.length > 0 && (
                <div className="d-flex gap-3 mb-2 small text-muted">
                  <span><span className="d-inline-block rounded-1 me-1" style={{width:'10px', height:'10px', background:'var(--cyan-accent, #06b6d4)'}}></span>Available</span>
                  <span><span className="d-inline-block rounded-1 me-1" style={{width:'10px', height:'10px', background:'#e2e8f0'}}></span>Booked</span>
                </div>
              )}

              {slotsError && (
                <div className="alert alert-warning py-2 small rounded-3">
                  {slotsError}
                </div>
              )}

              {!loadingSlots && allSlots.length > 0 && (
                <div className="d-flex flex-wrap gap-2 pt-1">
                  {allSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot)
                    const isSelected = form.appointmenttime === slot
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isBooked}
                        onClick={() => !isBooked && handleSelectSlot(slot)}
                        title={isBooked ? 'Already booked by another patient' : ''}
                        className={`btn btn-sm px-3 py-2 fw-semibold rounded-3 transition-all ${
                          isBooked
                            ? 'btn-light text-muted border'
                            : isSelected
                              ? 'btn-cyan-gradient shadow-sm'
                              : 'btn-outline-primary'
                        }`}
                        style={{
                          minWidth: '100px',
                          opacity: isBooked ? 0.55 : 1,
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          textDecoration: isBooked ? 'line-through' : 'none'
                        }}
                      >
                        {formatTime(slot)}
                        {isBooked && <span className="d-block" style={{fontSize:'0.65rem'}}>Booked</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* REASON FOR VISIT */}
          <div className="mb-4">
            <label className="form-label fw-semibold">3. Reason for Visit (Optional)</label>
            <input
              type="text"
              className="form-control"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="e.g. Routine checkup, Fever, Skin consultation..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-cyan-gradient w-100 py-2.5 fw-bold fs-6"
            disabled={!form.appointmentdate || !form.appointmenttime}
          >
            Confirm & Book Appointment
          </button>
        </form>
      </div>
    </div>
  )
}