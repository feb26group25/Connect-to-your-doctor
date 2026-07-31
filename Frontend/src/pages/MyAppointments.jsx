import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function MyAppointments() {
  const { user } = useSelector((state) => state.auth)
  const [appointments, setAppointments] = useState([])
  const [msg, setMsg] = useState('')
  const [activePrescription, setActivePrescription] = useState(null)
  const [feedbackState, setFeedbackState] = useState({})

  const fetchAppointments = () => {
    const patientId = user?.userId || user?.userid;
    if (!patientId) return;
    fetch(`http://localhost:9000/appointments/patient/${patientId}`)
      .then(resp => resp.json())
      .then(data => {
        if(data.length === 0) setMsg('No appointments found.')
        setAppointments(data)
      })
      .catch(() => setMsg('Could not fetch appointments.'))
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const handleCancel = (appointmentid) => {
    if(!window.confirm('Cancel this appointment?')) return
    fetch(`http://localhost:9000/appointment/cancel/${appointmentid}`, { method: 'PUT' })
      .then(resp => { if(resp.status === 200) fetchAppointments() })
  }

  const handleViewPrescription = (appointmentId) => {
    fetch(`http://localhost:9000/prescription/appointment/${appointmentId}`)
      .then(resp => {
        if(resp.ok) return resp.json()
        throw new Error('No prescription found')
      })
      .then(data => setActivePrescription(data))
      .catch(() => alert('Prescription details not available yet.'))
  }

  const handleFeedbackSubmit = (appointmentId) => {
    const fb = feedbackState[appointmentId] || { rating: 5, comments: '' }
    fetch('http://localhost:9000/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentid: appointmentId,
        rating: fb.rating || 5,
        comments: fb.comments || ''
      })
    })
      .then(resp => {
        if(resp.ok) alert('✓ Rating & Feedback submitted successfully!')
        else alert('Feedback submission failed.')
      })
  }

  const getStatusBadgeClass = (status) => {
    if(status === 'Pending') return 'badge-pending'
    if(status === 'Accepted') return 'badge-accepted'
    if(status === 'Completed') return 'badge-completed'
    if(status === 'Rejected' || status === 'Cancelled') return 'badge-cancelled'
    return 'badge-pending'
  }

  return (
    <div style={{minHeight:'100vh', padding:'8px'}}>
      
      {/* HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-1" style={{color:'var(--navy-dark)'}}>My Appointments</h3>
          <p className="text-muted small mb-0">Manage schedule, digital prescriptions, and doctor reviews</p>
        </div>
        <span className="badge badge-status badge-completed fs-6">
          {appointments.length} Appointments Total
        </span>
      </div>

      {msg && appointments.length === 0 && (
        <div className="card glass-card p-5 text-center">
          <p className="text-muted mb-3">No appointments booked yet.</p>
          <a href="/user-dashboard/search" className="btn btn-cyan-gradient px-4 py-2 fw-bold">
            Book an Appointment Now
          </a>
        </div>
      )}

      {/* PRESCRIPTION DETAILS MODAL CARD */}
      {activePrescription && (
        <div className="card glass-card p-4 mb-4" style={{borderLeft:'6px solid var(--cyan-accent)', background:'rgba(240,249,255,0.95)'}}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{color:'var(--navy-dark)'}}>📋 Digital Prescription & Medicines</h5>
            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => setActivePrescription(null)}>✕ Close</button>
          </div>
          <p className="mb-2"><b>Clinical Diagnosis:</b> <span className="text-primary fw-semibold">{activePrescription.whatWasDiagnosed}</span></p>
          {activePrescription.followUpDate && <p className="mb-3 text-muted small"><b>Follow-up Date:</b> {activePrescription.followUpDate}</p>}

          <h6 className="fw-bold text-dark mt-3 mb-2">Prescribed Medications:</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered bg-white rounded">
              <thead className="table-light">
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Timing</th>
                  <th>Instructions / Comments</th>
                </tr>
              </thead>
              <tbody>
                {activePrescription.medicines?.map(m => (
                  <tr key={m.medicineId}>
                    <td className="fw-semibold text-dark">{m.nameOfMedicine}</td>
                    <td>{m.dosage || '—'}</td>
                    <td>{m.timing || '—'}</td>
                    <td className="text-muted">{m.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="row g-4">
        {appointments.map(a => (
          <div className="col-md-6" key={a.appointmentid}>
            <div className="card glass-card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-0" style={{color:'var(--navy-dark)'}}>Dr. {a.firstname} {a.lastname}</h5>
                    <span className="text-muted small fw-semibold">{a.specialization} — {a.hospitalname}</span>
                  </div>
                  <span className={`badge badge-status ${getStatusBadgeClass(a.status)}`}>
                    {a.status}
                  </span>
                </div>

                <div className="row small my-3 p-3 rounded-3" style={{background:'rgba(248,250,252,0.8)', border:'1px solid #e2e8f0'}}>
                  <div className="col-6 mb-2">
                    <span className="text-muted d-block small">Date</span>
                    <span className="fw-semibold text-dark">{a.appointmentdate?.split('T')[0]}</span>
                  </div>
                  <div className="col-6 mb-2">
                    <span className="text-muted d-block small">Time Slot</span>
                    <span className="fw-semibold text-dark">{a.appointmenttime}</span>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-block small">Reason</span>
                    <span className="fw-semibold text-dark">{a.reason}</span>
                  </div>
                </div>

                {a.status === 'Pending' && (
                  <button className="btn btn-outline-danger btn-sm w-100 fw-semibold rounded-3 mt-2"
                    onClick={() => handleCancel(a.appointmentid)}>
                    Cancel Appointment
                  </button>
                )}

                {a.status === 'Completed' && (
                  <div className="mt-3 pt-3 border-top">
                    <button className="btn btn-sm btn-outline-primary w-100 fw-bold mb-3 rounded-3"
                      onClick={() => handleViewPrescription(a.appointmentid)}>
                      📋 View Prescription & Medicines
                    </button>

                    {/* FEEDBACK FORM */}
                    <div className="p-3 rounded-3" style={{background:'rgba(241,245,249,0.9)', border:'1px solid #e2e8f0'}}>
                      <span className="fw-bold small d-block mb-2 text-dark">Rate Visit & Feedback</span>
                      <div className="d-flex gap-2 mb-2">
                        <select className="form-select form-select-sm" style={{width:'110px'}}
                          value={feedbackState[a.appointmentid]?.rating || 5}
                          onChange={(e) => setFeedbackState({
                            ...feedbackState,
                            [a.appointmentid]: { ...(feedbackState[a.appointmentid] || {}), rating: Number(e.target.value) }
                          })}>
                          <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                          <option value="4">⭐⭐⭐⭐ (4/5)</option>
                          <option value="3">⭐⭐⭐ (3/5)</option>
                          <option value="2">⭐⭐ (2/5)</option>
                          <option value="1">⭐ (1/5)</option>
                        </select>
                        <input type="text" className="form-control form-control-sm"
                          placeholder="Your review comment..."
                          value={feedbackState[a.appointmentid]?.comments || ''}
                          onChange={(e) => setFeedbackState({
                            ...feedbackState,
                            [a.appointmentid]: { ...(feedbackState[a.appointmentid] || {}), comments: e.target.value }
                          })} />
                      </div>
                      <button className="btn btn-cyan-gradient btn-sm w-100 fw-bold"
                        onClick={() => handleFeedbackSubmit(a.appointmentid)}>
                        Submit Doctor Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}