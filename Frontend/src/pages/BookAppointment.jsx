import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

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
  const [msg, setMsg] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetch('http://localhost:9000/appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientid: user.userid,
        doctorid: doctor.doctorid,
        appointmentdate: form.appointmentdate,
        appointmenttime: form.appointmenttime,
        reason: form.reason
      })
    })
      .then(resp => {
        if(resp.status === 200) {
          setMsg('Appointment booked successfully!')
          setTimeout(() => navigate('/user-dashboard/myappointments'), 1500)
        } else {
          setMsg('Booking failed. Try again.')
        }
      })
  }

  return (
    <div>
      <button className="btn btn-outline-secondary mb-3"
        onClick={() => navigate('/user-dashboard/search')}>← Back</button>

      <h4>Book Appointment</h4>

      {doctor && (
        <div className="alert alert-info mb-4">
          <b>Doctor:</b> Dr. {doctor.firstname} {doctor.lastname} &nbsp;|&nbsp;
          <b>Specialization:</b> {doctor.specialization} &nbsp;|&nbsp;
          <b>Hospital:</b> {doctor.hospitalname}
        </div>
      )}

      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={handleSubmit} style={{maxWidth:'400px'}}>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input type="date" className="form-control" name="appointmentdate"
            value={form.appointmentdate} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Time</label>
          <input type="time" className="form-control" name="appointmenttime"
            value={form.appointmenttime} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Reason for Visit</label>
          <input type="text" className="form-control" name="reason"
            value={form.reason} onChange={handleChange} placeholder="Brief reason..." />
        </div>
        <button type="submit" className="btn btn-primary">Confirm Booking</button>
      </form>
    </div>
  )
}