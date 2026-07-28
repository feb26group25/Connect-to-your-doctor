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
    fetch(`http://localhost:9000/appointments/doctor/${user.userid}`)
      .then(resp => resp.json())
      .then(data => {
        if(data.length === 0) setMsg('No appointments found.')
        else setMsg('')
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

  const filtered = filter === 'All'
    ? appointments
    : appointments.filter(a => a.status === filter)

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{color:'#1a3c8f'}}>My Appointments</h4>
        <p className="text-muted small">View and manage your patient appointments</p>
      </div>

      {/* FILTER TABS */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['All','Pending','Accepted','Completed','Rejected','Cancelled'].map(f => (
          <button key={f}
            className="btn btn-sm fw-semibold px-3"
            style={{
              borderRadius:'20px',
              background: filter === f ? 'linear-gradient(135deg, #1a3c8f, #2563eb)' : '#fff',
              color: filter === f ? '#fff' : '#1a3c8f',
              border: `1.5px solid ${filter === f ? 'transparent' : '#1a3c8f'}`
            }}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      {/* APPOINTMENT CARDS */}
      <div className="row g-4">
        {filtered.map(a => {
          const badge = getBadge(a.status)
          return (
            <div className="col-md-6" key={a.appointmentid}>
              <div className="card border-0 shadow-sm h-100"
                style={{borderRadius:'16px', overflow:'hidden'}}>

                {/* CARD TOP */}
                <div className="p-3 text-white d-flex justify-content-between align-items-center"
                  style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
                  <div>
                    <div className="fw-bold">{a.patientfirst} {a.patientlast}</div>
                    <div className="small opacity-75">{a.patientemail}</div>
                  </div>
                  <span className="badge px-3 py-2 fw-semibold rounded-pill"
                    style={{background:badge.bg, color:badge.color}}>
                    {a.status}
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="card-body p-4">
                  <div className="row small mb-3">
                    <div className="col-6 mb-2">
                      <span className="text-muted d-block">Date</span>
                      <span className="fw-semibold">{a.appointmentdate?.split('T')[0]}</span>
                    </div>
                    <div className="col-6 mb-2">
                      <span className="text-muted d-block">Time</span>
                      <span className="fw-semibold">{a.appointmenttime}</span>
                    </div>
                    <div className="col-12">
                      <span className="text-muted d-block">Reason</span>
                      <span className="fw-semibold">{a.reason || '—'}</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="d-flex gap-2">
                    {a.status === 'Pending' && <>
                      <button className="btn btn-sm fw-semibold px-3 flex-grow-1"
                        style={{background:'#e8fdf4', color:'#1a8a5a', borderRadius:'8px'}}
                        onClick={() => handleAction(a.appointmentid, 'accept')}>
                        Accept
                      </button>
                      <button className="btn btn-sm fw-semibold px-3 flex-grow-1"
                        style={{background:'#fdeaea', color:'#a81a1a', borderRadius:'8px'}}
                        onClick={() => handleAction(a.appointmentid, 'reject')}>
                        Reject
                      </button>
                    </>}
                    {a.status === 'Accepted' && <>
                      <button className="btn btn-sm fw-semibold px-3 flex-grow-1"
                        style={{background:'#e8f4fd', color:'#1a6fa8', borderRadius:'8px'}}
                        onClick={() => handleAction(a.appointmentid, 'complete')}>
                        Mark Complete
                      </button>
                      <button className="btn btn-sm fw-semibold px-3 flex-grow-1"
                        style={{background:'#fdeaea', color:'#a81a1a', borderRadius:'8px'}}
                        onClick={() => handleAction(a.appointmentid, 'reject')}>
                        Cancel
                      </button>
                    </>}
                    {a.status === 'Completed' &&
                      <button className="btn btn-sm fw-semibold px-3 w-100"
                        style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)', color:'white', borderRadius:'8px'}}
                        onClick={() => navigate('/doctor-dashboard/prescription',
                          { state: { appointment: a } })}>
                        Add Prescription
                      </button>
                    }
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