import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DOCTOR_API, APPOINTMENT_API } from '../api'

export default function BookAppointment() {
  const { state } = useLocation()
  const preselectedDoctor = state?.doctor
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [doctorsList, setDoctorsList] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || null)

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

  // Fetch all doctors for the doctor selection dropdown
  useEffect(() => {
    fetch(`${DOCTOR_API}/api/doctors`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unique = []
          const seen = new Set()
          for (const doc of data) {
            const key = (doc.email || doc.doctorName || String(doc.doctorId || doc.userId)).toLowerCase()
            if (!seen.has(key)) {
              seen.add(key)
              unique.push(doc)
            }
          }
          setDoctorsList(unique)
          if (!selectedDoctor && unique.length > 0) {
            setSelectedDoctor(unique[0])
          }
        }
      })
      .catch(() => {})
  }, [])

  const docId = selectedDoctor?.doctorId || selectedDoctor?.doctorid

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
            setSlotsError('No time slots configured for this date. Default slots may apply.')
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

  const allSlots = [...new Set([...availableSlots, ...bookedSlots])].sort()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDoctorChange = (e) => {
    const doctorId = parseInt(e.target.value)
    const doc = doctorsList.find(d => (d.doctorId || d.userId) === doctorId)
    setSelectedDoctor(doc)
    setForm(prev => ({ ...prev, appointmenttime: '' }))
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
          setForm(prev => ({ ...prev, appointmenttime: '' }))
          fetchSlots()
        }
      })
      .catch(() => {
        setMsg({ text: 'Network error. Please try again.', type: 'danger' })
      })
  }

  const doctorDisplayName = selectedDoctor?.doctorName || `Dr. ${selectedDoctor?.firstname || ''} ${selectedDoctor?.lastname || ''}`.trim()
  const hospitalDisplayName = selectedDoctor?.hospital?.hospitalName || selectedDoctor?.hospitalname || 'CityCare Hospital'

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

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '12px' }}>
      <button
        className="btn btn-outline-secondary btn-sm mb-3 rounded-pill px-3 shadow-sm"
        onClick={() => navigate('/user-dashboard/search')}
      >
        &larr; Back to Search Doctors
      </button>

      <div className="card glass-card p-4 shadow-sm" style={{ borderRadius: '16px' }}>
        <h4 className="fw-bold mb-3" style={{ color: 'var(--navy-dark)' }}>
          Book Doctor Consultation
        </h4>

        {/* DOCTOR SELECTION DROPDOWN */}
        <div className="mb-4">
          <label className="form-label fw-bold small text-muted">
            1. Select Doctor & Specialization
          </label>
          <select
            className="form-select form-select-lg"
            value={docId || ''}
            onChange={handleDoctorChange}
            style={{
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.95rem'
            }}
          >
            {doctorsList.map((d) => {
              const dId = d.doctorId || d.userId
              const dName = d.doctorName?.startsWith('Dr.') ? d.doctorName : `Dr. ${d.doctorName}`
              return (
                <option key={dId} value={dId}>
                  {dName} &mdash; {d.specialization} ({d.hospital?.hospitalName || 'CityCare'})
                </option>
              )
            })}
          </select>
        </div>

        {selectedDoctor && (
          <div
            className="card p-3 mb-4 border-0"
            style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              borderRadius: '12px',
              borderLeft: '4px solid #2563eb'
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <div className="fw-bold text-dark fs-5">{doctorDisplayName}</div>
                <div className="small text-muted">
                  Specialization: {selectedDoctor.specialization} &bull; Hospital: {hospitalDisplayName} &bull; Qualification: {selectedDoctor.degree || 'MBBS, MD'}
                </div>
              </div>
              <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                Consultation Fee: Rs. 600
              </span>
            </div>
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
            <label className="form-label fw-bold small text-muted">
              2. Select Appointment Date
            </label>
            <input
              type="date"
              className="form-control form-control-lg"
              name="appointmentdate"
              min={todayStr}
              value={form.appointmentdate}
              onChange={handleChange}
              style={{ borderRadius: '10px', fontSize: '0.95rem' }}
              required
            />
          </div>

          {/* TIME SLOTS SECTION */}
          {form.appointmentdate && (
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted d-flex justify-content-between align-items-center">
                <span>3. Select Available Consultation Slot</span>
                {loadingSlots && (
                  <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                )}
              </label>

              {!loadingSlots && allSlots.length > 0 && (
                <div className="d-flex gap-3 mb-2 small text-muted">
                  <span>
                    <span
                      className="d-inline-block rounded-1 me-1"
                      style={{ width: '12px', height: '12px', background: '#2563eb' }}
                    ></span>
                    Available
                  </span>
                  <span>
                    <span
                      className="d-inline-block rounded-1 me-1"
                      style={{ width: '12px', height: '12px', background: '#e2e8f0' }}
                    ></span>
                    Booked
                  </span>
                </div>
              )}

              {slotsError && (
                <div className="alert alert-info py-2 small rounded-3">
                  {slotsError}
                </div>
              )}

              {!loadingSlots && allSlots.length > 0 ? (
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
                              ? 'btn-primary shadow-sm'
                              : 'btn-outline-primary'
                        }`}
                        style={{
                          minWidth: '105px',
                          opacity: isBooked ? 0.55 : 1,
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          textDecoration: isBooked ? 'line-through' : 'none'
                        }}
                      >
                        {formatTime(slot)}
                        {isBooked && <span className="d-block" style={{ fontSize: '0.65rem' }}>Booked</span>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                !loadingSlots && (
                  <div className="d-flex flex-wrap gap-2 pt-1">
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map((slot) => {
                      const isSelected = form.appointmenttime === slot
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => handleSelectSlot(slot)}
                          className={`btn btn-sm px-3 py-2 fw-semibold rounded-3 ${
                            isSelected ? 'btn-primary shadow-sm' : 'btn-outline-primary'
                          }`}
                          style={{ minWidth: '105px' }}
                        >
                          {formatTime(slot)}
                        </button>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          )}

          {/* REASON FOR VISIT */}
          <div className="mb-4">
            <label className="form-label fw-bold small text-muted">
              4. Symptoms / Reason for Visit (Optional)
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="e.g. Chest discomfort, Routine health checkup, Skin consultation..."
              style={{ borderRadius: '10px', fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 fw-bold fs-6 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #1a3c8f, #2563eb)',
              borderRadius: '10px'
            }}
            disabled={!form.appointmentdate || !form.appointmenttime}
          >
            Confirm & Book Appointment
          </button>
        </form>
      </div>
    </div>
  )
}