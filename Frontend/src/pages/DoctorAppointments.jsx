import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function DoctorAppointments() {
  const { user } = useSelector((state) => state.auth)
  const [appointments, setAppointments] = useState([])
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  const fetchAppointments = () => {
    const docId = user?.userId || user?.userid;
    if (!docId) return;
    fetch(`http://localhost:9000/appointments/doctor/${docId}`)
      .then(resp => resp.json())
      .then(data => {
        if(data.length === 0) setMsg('No appointments found.')
        else setMsg('')
        setAppointments(data)
      })
      .catch(() => setMsg('Could not fetch appointments.'))
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const handleAction = (appointmentid, action) => {
    fetch(`http://localhost:9000/appointment/${action}/${appointmentid}`, {
      method: 'PUT'
    })
      .then(resp => {
        if(resp.status === 200) fetchAppointments()
        else alert('Action failed.')
      })
  }

  const getStatusBadgeClass = (status) => {
    if(status === 'Pending') return 'badge-pending'
    if(status === 'Accepted') return 'badge-accepted'
    if(status === 'Completed') return 'badge-completed'
    if(status === 'Rejected' || status === 'Cancelled') return 'badge-cancelled'
    return 'badge-pending'
  }

  const filtered = filter === 'All'
    ? appointments
    : appointments.filter(a => a.status === filter)

  return (
    <div style={{minHeight:'100vh', padding:'8px'}}>
      
      {/* PAGE HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-1" style={{color:'var(--navy-dark)'}}>Doctor Appointments Console</h3>
          <p className="text-muted small mb-0">Review consultation requests, manage appointment status, and issue prescriptions</p>
        </div>
        <span className="badge badge-status badge-completed fs-6">
          {appointments.length} Total Patients
        </span>
      </div>

      {/* FILTER CHIPS */}
      <div className="card glass-card p-3 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {['All','Pending','Accepted','Completed','Rejected','Cancelled'].map(f => (
            <button key={f}
              className={`btn btn-sm px-3.5 fw-semibold rounded-pill ${filter === f ? 'btn-cyan-gradient' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {msg && <div className="alert alert-info py-2.5 rounded-3">{msg}</div>}

      {/* APPOINTMENT CARDS */}
      <div className="row g-4">
        {filtered.map(a => (
          <div className="col-md-6" key={a.appointmentid}>
            <div className="card glass-card h-100 overflow-hidden">

              {/* CARD TOP */}
              <div className="p-3 text-white d-flex justify-content-between align-items-center"
                style={{background:'var(--blue-gradient)'}}>
                <div>
                  <h5 className="fw-bold mb-0 text-white">{a.patientfirst} {a.patientlast}</h5>
                  <span className="small opacity-75">{a.patientemail}</span>
                </div>
                <span className={`badge badge-status ${getStatusBadgeClass(a.status)}`}>
                  {a.status}
                </span>
              </div>

              {/* CARD BODY */}
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div className="row small p-3 rounded-3 mb-3" style={{background:'rgba(248,250,252,0.8)', border:'1px solid #e2e8f0'}}>
                  <div className="col-6 mb-2">
                    <span className="text-muted d-block small">Date</span>
                    <span className="fw-semibold text-dark">{a.appointmentdate?.split('T')[0]}</span>
                  </div>
                  <div className="col-6 mb-2">
                    <span className="text-muted d-block small">Time Slot</span>
                    <span className="fw-semibold text-dark">{a.appointmenttime}</span>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-block small">Chief Complaint / Reason</span>
                    <span className="fw-semibold text-dark">{a.reason || '—'}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="d-flex gap-2">
                  {a.status === 'Pending' && <>
                    <button className="btn btn-sm btn-success flex-grow-1 fw-bold py-2 rounded-3"
                      onClick={() => handleAction(a.appointmentid, 'accept')}>
                      Accept
                    </button>
                    <button className="btn btn-sm btn-outline-danger flex-grow-1 fw-bold py-2 rounded-3"
                      onClick={() => handleAction(a.appointmentid, 'reject')}>
                      Reject
                    </button>
                  </>}
                  {a.status === 'Accepted' && <>
                    <button className="btn btn-cyan-gradient btn-sm flex-grow-1 fw-bold py-2"
                      onClick={() => handleAction(a.appointmentid, 'complete')}>
                      Mark Complete
                    </button>
                    <button className="btn btn-sm btn-outline-danger flex-grow-1 fw-bold py-2 rounded-3"
                      onClick={() => handleAction(a.appointmentid, 'reject')}>
                      Cancel
                    </button>
                  </>}
                  {a.status === 'Completed' &&
                    <button className="btn btn-cyan-gradient btn-sm w-100 fw-bold py-2"
                      onClick={() => navigate('/doctor-dashboard/prescription', { state: { appointment: a } })}>
                      💊 Write / View Prescription
                    </button>
                  }
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}