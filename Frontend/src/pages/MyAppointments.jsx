import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function MyAppointments() {
  const { user } = useSelector((state) => state.auth)
  const [appointments, setAppointments] = useState([])
  const [msg, setMsg] = useState('')

  const fetchAppointments = () => {
    fetch(`http://localhost:9000/appointments/patient/${user.userid}`)
      .then(resp => resp.json())
      .then(data => {
        if(data.length === 0) setMsg('No appointments found.')
        setAppointments(data)
      })
      .catch(() => setMsg('Could not fetch appointments.'))
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleCancel = (appointmentid) => {
    if(!window.confirm('Cancel this appointment?')) return
    fetch(`http://localhost:9000/appointment/cancel/${appointmentid}`, { method: 'PUT' })
      .then(resp => { if(resp.status === 200) fetchAppointments() })
  }

  const getBadge = (status) => {
    if(status === 'Pending') return 'bg-warning text-dark'
    if(status === 'Accepted') return 'bg-success'
    if(status === 'Rejected') return 'bg-danger'
    if(status === 'Cancelled') return 'bg-secondary'
    if(status === 'Completed') return 'bg-primary'
    return 'bg-secondary'
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">My Appointments</h4>
        <p className="text-muted small">Track all your appointments and their status</p>
      </div>

      {msg && appointments.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center">
          <p className="text-muted mb-3">No appointments yet.</p>
          <a href="/user-dashboard/search" className="btn btn-primary px-4">Book an Appointment</a>
        </div>
      )}

      <div className="row g-4">
        {appointments.map(a => (
          <div className="col-md-6" key={a.appointmentid}>
            <div className="card border-0 shadow-sm h-100" style={{borderRadius:'14px'}}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-bold mb-0">Dr. {a.firstname} {a.lastname}</h6>
                    <span className="text-muted small">{a.specialization} — {a.hospitalname}</span>
                  </div>
                  <span className={`badge ${getBadge(a.status)}`}>{a.status}</span>
                </div>
                <hr className="my-2"/>
                <div className="row small">
                  <div className="col-6 mb-2">
                    <span className="text-muted">Date</span>
                    <p className="fw-semibold mb-0">{a.appointmentdate?.split('T')[0]}</p>
                  </div>
                  <div className="col-6 mb-2">
                    <span className="text-muted">Time</span>
                    <p className="fw-semibold mb-0">{a.appointmenttime}</p>
                  </div>
                  <div className="col-12">
                    <span className="text-muted">Reason</span>
                    <p className="fw-semibold mb-0">{a.reason}</p>
                  </div>
                </div>
                {a.status === 'Pending' && (
                  <button className="btn btn-outline-danger btn-sm mt-3 w-100"
                    onClick={() => handleCancel(a.appointmentid)}>
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}