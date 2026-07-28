import { useEffect, useState } from 'react'

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([])
  const [msg, setMsg] = useState('')

  const fetchAppointments = () => {
    fetch('http://localhost:9000/appointments')
      .then(resp => resp.json())
      .then(data => {
        if(data.length === 0) setMsg('No appointments found.')
        setAppointments(data)
      })
      .catch(() => setMsg('Could not fetch appointments.'))
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleAction = (appointmentid, action) => {
    fetch(`http://localhost:9000/appointment/${action}/${appointmentid}`, {
      method: 'PUT'
    })
      .then(resp => {
        if(resp.status === 200) fetchAppointments()
        else alert('Action failed.')
      })
  }

  const getBadge = (status) => {
    if(status === 'Pending') return {bg:'#fff4e5', color:'#c07020'}
    if(status === 'Accepted') return {bg:'#e8fdf4', color:'#1a8a5a'}
    if(status === 'Rejected') return {bg:'#fdeaea', color:'#a81a1a'}
    if(status === 'Cancelled') return {bg:'#f0f0f0', color:'#555'}
    if(status === 'Completed') return {bg:'#e8f4fd', color:'#1a6fa8'}
    return {bg:'#f0f0f0', color:'#555'}
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{color:'#1a3c8f'}}>All Appointments</h4>
        <p className="text-muted small">View and manage all appointments</p>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="card border-0 shadow-sm" style={{borderRadius:'16px', overflow:'hidden'}}>
        <div className="p-3 text-white d-flex align-items-center justify-content-between"
          style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
          <span className="fw-bold">Appointments List</span>
          <span className="badge bg-white fw-semibold" style={{color:'#1a3c8f'}}>
            Total: {appointments.length}
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3">Doctor</th>
                <th className="py-3">Hospital</th>
                <th className="py-3">Date</th>
                <th className="py-3">Time</th>
                <th className="py-3">Reason</th>
                <th className="py-3">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => {
                const badge = getBadge(a.status)
                return (
                  <tr key={a.appointmentid}>
                    <td className="py-3 px-4 fw-semibold">{a.patientfirst} {a.patientlast}</td>
                    <td className="py-3">Dr. {a.doctorfirst} {a.doctorlast}</td>
                    <td className="py-3 text-muted small">{a.hospitalname}</td>
                    <td className="py-3 text-muted small">{a.appointmentdate?.split('T')[0]}</td>
                    <td className="py-3 text-muted small">{a.appointmenttime}</td>
                    <td className="py-3 text-muted small">{a.reason}</td>
                    <td className="py-3">
                      <span className="badge px-3 py-2 fw-semibold small rounded-pill"
                        style={{background:badge.bg, color:badge.color}}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="d-flex gap-1">
                        {a.status === 'Pending' && <>
                          <button className="btn btn-sm fw-semibold px-3"
                            style={{background:'#e8fdf4', color:'#1a8a5a', borderRadius:'8px'}}
                            onClick={() => handleAction(a.appointmentid, 'accept')}>
                            Accept
                          </button>
                          <button className="btn btn-sm fw-semibold px-3"
                            style={{background:'#fdeaea', color:'#a81a1a', borderRadius:'8px'}}
                            onClick={() => handleAction(a.appointmentid, 'reject')}>
                            Reject
                          </button>
                        </>}
                        {a.status === 'Accepted' &&
                          <button className="btn btn-sm fw-semibold px-3"
                            style={{background:'#e8f4fd', color:'#1a6fa8', borderRadius:'8px'}}
                            onClick={() => handleAction(a.appointmentid, 'complete')}>
                            Complete
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}