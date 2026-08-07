import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { APPOINTMENT_API } from '../api'

export default function MyAppointments() {
  const { user } = useSelector((state) => state.auth)
  const [appointments, setAppointments] = useState([])
  const [prescriptionsMap, setPrescriptionsMap] = useState({}) // appointmentId -> prescription object
  const [activePrescription, setActivePrescription] = useState(null)
  const [feedbackState, setFeedbackState] = useState({})
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchAppointments = () => {
    const patientId = user?.userId || user?.userid
    if (!patientId) return
    setLoading(true)
    fetch(`${APPOINTMENT_API}/appointments/patient/${patientId}`)
      .then(resp => resp.json())
      .then(data => {
        setLoading(false)
        if (Array.isArray(data)) {
          setAppointments(data)
          if (data.length === 0) {
            setMsg('No appointments found.')
          } else {
            setMsg('')
            // Fetch prescription details for all completed appointments automatically
            data.forEach(a => {
              if (a.status === 'Completed') {
                fetch(`${APPOINTMENT_API}/prescription/appointment/${a.appointmentid}`)
                  .then(r => r.ok ? r.json() : null)
                  .then(rx => {
                    if (rx) {
                      setPrescriptionsMap(prev => ({ ...prev, [a.appointmentid]: rx }))
                    }
                  })
                  .catch(() => {})
              }
            })
          }
        }
      })
      .catch(() => {
        setLoading(false)
        setMsg('Could not fetch appointments.')
      })
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const handleCancel = (appointmentid) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    fetch(`${APPOINTMENT_API}/appointment/cancel/${appointmentid}`, { method: 'PUT' })
      .then(resp => {
        if (resp.status === 200) fetchAppointments()
      })
  }

  const handleFeedbackSubmit = (appointmentId) => {
    const fb = feedbackState[appointmentId] || { rating: 5, comments: '' }
    fetch(`${APPOINTMENT_API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentid: appointmentId,
        rating: fb.rating || 5,
        comments: fb.comments || ''
      })
    })
      .then(resp => {
        if (resp.ok) {
          alert('Rating and feedback submitted successfully.')
        } else {
          alert('Feedback submission failed.')
        }
      })
      .catch(() => alert('Network error submitting feedback.'))
  }

  const getStatusBadgeClass = (status) => {
    if (status === 'Pending') return 'badge-pending'
    if (status === 'Accepted') return 'badge-accepted'
    if (status === 'Completed') return 'badge-completed'
    if (status === 'Rejected' || status === 'Cancelled') return 'badge-cancelled'
    return 'badge-pending'
  }

  return (
    <div style={{ minHeight: '100vh', padding: '12px' }}>
      {/* HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--navy-dark)' }}>
            My Appointments & Prescriptions
          </h3>
          <p className="text-muted small mb-0">
            View consultation schedules, doctor diagnoses, digital prescriptions, and submit feedback
          </p>
        </div>
        <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">
          {appointments.length} Appointments Total
        </span>
      </div>

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p>Loading your appointments and prescriptions...</p>
        </div>
      )}

      {msg && appointments.length === 0 && !loading && (
        <div className="card glass-card p-5 text-center shadow-sm" style={{ borderRadius: '16px' }}>
          <p className="text-muted mb-3">No appointments booked yet.</p>
          <a href="/user-dashboard/search" className="btn btn-primary px-4 py-2 fw-bold mx-auto rounded-pill">
            Book an Appointment Now
          </a>
        </div>
      )}

      {/* MODAL / BANNER POPUP FOR FULL PRESCRIPTION DETAILS */}
      {activePrescription && (
        <div
          className="card glass-card p-4 mb-4 shadow"
          style={{
            borderRadius: '16px',
            borderLeft: '6px solid #2563eb',
            background: '#ffffff'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 text-dark">
              Digital Medical Prescription
            </h5>
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => setActivePrescription(null)}
            >
              Close
            </button>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <span className="text-muted small d-block">Clinical Diagnosis:</span>
              <strong className="text-primary fs-6">
                {activePrescription.whatWasDiagnosed || 'General Consultation / Clinical Assessment'}
              </strong>
            </div>
            {activePrescription.followUpDate && (
              <div className="col-md-6">
                <span className="text-muted small d-block">Recommended Follow-up Date:</span>
                <strong className="text-dark">
                  {activePrescription.followUpDate}
                </strong>
              </div>
            )}
          </div>

          <h6 className="fw-bold text-dark mt-2 mb-2">Prescribed Medications:</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered bg-white mb-0" style={{ borderRadius: '8px' }}>
              <thead className="table-light">
                <tr>
                  <th>Medicine Name</th>
                  <th>Dosage</th>
                  <th>Timing / Schedule</th>
                  <th>Instructions / Comments</th>
                </tr>
              </thead>
              <tbody>
                {activePrescription.medicines && activePrescription.medicines.length > 0 ? (
                  activePrescription.medicines.map((m, idx) => (
                    <tr key={m.medicineId || idx}>
                      <td className="fw-semibold text-dark">{m.nameOfMedicine}</td>
                      <td>{m.dosage || '—'}</td>
                      <td>{m.timing || '—'}</td>
                      <td className="text-muted">{m.comment || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-2">
                      No specific medicines listed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPOINTMENT CARDS LIST */}
      <div className="row g-4">
        {appointments.map((a) => {
          const rx = prescriptionsMap[a.appointmentid]
          const isCompleted = a.status === 'Completed'

          return (
            <div className="col-lg-6" key={a.appointmentid}>
              <div
                className="card glass-card h-100 shadow-sm border-0"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  borderLeft: isCompleted ? '5px solid #10b981' : a.status === 'Accepted' ? '5px solid #2563eb' : '5px solid #f59e0b'
                }}
              >
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  {/* CARD HEADER */}
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-1 text-dark">
                          {a.doctorName?.startsWith('Dr.') ? a.doctorName : `Dr. ${a.doctorfirst || ''} ${a.doctorlast || ''}`.trim()}
                        </h5>
                        <div className="small text-muted">
                          <span className="fw-semibold">{a.specialization || 'Medical Specialist'}</span>
                          {a.hospitalname && <span> &bull; {a.hospitalname}</span>}
                        </div>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(a.status)} px-3 py-1.5 fs-6 rounded-pill`}>
                        {a.status}
                      </span>
                    </div>

                    {/* CONSULTATION TIME & REASON */}
                    <div
                      className="p-3 rounded-3 my-3"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div className="row small">
                        <div className="col-6 mb-2">
                          <span className="text-muted d-block small">Appointment Date:</span>
                          <strong className="text-dark">
                            {a.appointmentdate ? a.appointmentdate.split('T')[0] : '—'}
                          </strong>
                        </div>
                        <div className="col-6 mb-2">
                          <span className="text-muted d-block small">Consultation Time:</span>
                          <strong className="text-dark">
                            {a.appointmenttime || '—'}
                          </strong>
                        </div>
                        <div className="col-12">
                          <span className="text-muted d-block small">Reason for Visit:</span>
                          <span className="text-dark">
                            {a.reason || 'General Health Consultation'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INLINE PRESCRIPTION CARD (IF COMPLETED) */}
                    {isCompleted && (
                      <div
                        className="p-3 rounded-3 mb-3"
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-success small fw-bold">
                            Doctor Prescription & Diagnosis
                          </strong>
                          {rx && (
                            <button
                              className="btn btn-sm btn-link p-0 text-decoration-none fw-bold small text-success"
                              onClick={() => setActivePrescription(rx)}
                            >
                              Expand View &rarr;
                            </button>
                          )}
                        </div>

                        {rx ? (
                          <div className="small">
                            <div className="mb-1.5">
                              <span className="text-muted">Diagnosis: </span>
                              <strong className="text-dark">
                                {rx.whatWasDiagnosed || 'Assessment Completed'}
                              </strong>
                            </div>
                            {rx.medicines && rx.medicines.length > 0 && (
                              <div className="mt-2">
                                <span className="text-muted d-block mb-1">Medicines ({rx.medicines.length}):</span>
                                <ul className="list-unstyled mb-0 ps-1">
                                  {rx.medicines.map((m, idx) => (
                                    <li key={idx} className="text-dark mb-1">
                                      &bull; <strong>{m.nameOfMedicine}</strong> {m.dosage ? `(${m.dosage})` : ''} {m.timing ? `- ${m.timing}` : ''}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {rx.followUpDate && (
                              <div className="mt-2 text-muted small">
                                Next Follow-up: <strong>{rx.followUpDate}</strong>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="small text-muted">
                            Prescription details recorded by doctor. Click below to load full medical sheet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS & FEEDBACK */}
                  <div>
                    {a.status === 'Pending' && (
                      <button
                        className="btn btn-outline-danger btn-sm w-100 fw-semibold rounded-3"
                        onClick={() => handleCancel(a.appointmentid)}
                      >
                        Cancel Appointment
                      </button>
                    )}

                    {isCompleted && (
                      <div className="mt-2 pt-3 border-top">
                        {/* VIEW FULL PRESCRIPTION BUTTON */}
                        <button
                          className="btn btn-sm btn-outline-primary w-100 fw-bold mb-3 rounded-3"
                          onClick={() => {
                            if (rx) {
                              setActivePrescription(rx)
                            } else {
                              fetch(`${APPOINTMENT_API}/prescription/appointment/${a.appointmentid}`)
                                .then(r => r.ok ? r.json() : null)
                                .then(data => {
                                  if (data) {
                                    setPrescriptionsMap(prev => ({ ...prev, [a.appointmentid]: data }))
                                    setActivePrescription(data)
                                  } else {
                                    alert('Prescription has not been uploaded yet.')
                                  }
                                })
                                .catch(() => alert('Prescription details not available.'))
                            }
                          }}
                        >
                          View Full Prescription Sheet
                        </button>

                        {/* PATIENT FEEDBACK FORM */}
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <span className="fw-bold small d-block mb-2 text-dark">
                            Rate Consultation & Leave Feedback:
                          </span>
                          <div className="d-flex gap-2 mb-2">
                            <select
                              className="form-select form-select-sm"
                              style={{ width: '130px', borderRadius: '8px' }}
                              value={feedbackState[a.appointmentid]?.rating || 5}
                              onChange={(e) =>
                                setFeedbackState({
                                  ...feedbackState,
                                  [a.appointmentid]: {
                                    ...(feedbackState[a.appointmentid] || {}),
                                    rating: Number(e.target.value)
                                  }
                                })
                              }
                            >
                              <option value="5">5 / 5 - Excellent</option>
                              <option value="4">4 / 5 - Very Good</option>
                              <option value="3">3 / 5 - Good</option>
                              <option value="2">2 / 5 - Fair</option>
                              <option value="1">1 / 5 - Poor</option>
                            </select>

                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Doctor feedback or comments..."
                              style={{ borderRadius: '8px' }}
                              value={feedbackState[a.appointmentid]?.comments || ''}
                              onChange={(e) =>
                                setFeedbackState({
                                  ...feedbackState,
                                  [a.appointmentid]: {
                                    ...(feedbackState[a.appointmentid] || {}),
                                    comments: e.target.value
                                  }
                                })
                              }
                            />
                          </div>

                          <button
                            className="btn btn-sm btn-primary w-100 fw-bold"
                            style={{ borderRadius: '8px' }}
                            onClick={() => handleFeedbackSubmit(a.appointmentid)}
                          >
                            Submit Review
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}