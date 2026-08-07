import { useState } from "react"
import { DOCTOR_API, SPECIALIZATIONS } from '../api'

export default function RegisterDoctor() {
  const [form, setForm] = useState({
    username: "", password: "", firstname: "",
    lastname: "", email: "", contactnumber: "",
    specialization: "", experience: "",
    qualification: "", hospitalname: ""
  })
  const [msg, setMsg] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    fetch(`${DOCTOR_API}/api/doctors/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((resp) => {
        setLoading(false)
        if (resp.status === 200) {
          setSuccess(true)
          setForm({
            username: "", password: "", firstname: "",
            lastname: "", email: "", contactnumber: "",
            specialization: "", experience: "",
            qualification: "", hospitalname: ""
          })
        } else {
          setMsg("Registration failed. Username or email may already exist.")
        }
      })
      .catch(() => {
        setLoading(false)
        setMsg("Network error. Please try again.")
      })
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{color:'#1a3c8f'}}>Register New Doctor</h4>
        <p className="text-muted small">Add a new verified doctor to the healthcare system</p>
      </div>

      <div className="card border-0 shadow-sm p-4" style={{borderRadius:'16px', maxWidth:'700px'}}>

        {success && <div className="alert alert-success small">✓ Doctor registered successfully!</div>}
        {msg && <div className="alert alert-danger small">{msg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label fw-semibold small">First Name</label>
              <input type="text" className="form-control" name="firstname"
                value={form.firstname} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Last Name</label>
              <input type="text" className="form-control" name="lastname"
                value={form.lastname} onChange={handleChange} required />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small">Username</label>
              <input type="text" className="form-control" name="username"
                value={form.username} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Password</label>
              <input type="password" className="form-control" name="password"
                value={form.password} onChange={handleChange} required />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small">Email</label>
              <input type="email" className="form-control" name="email"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Contact Number</label>
              <input type="text" className="form-control" name="contactnumber"
                value={form.contactnumber} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small">Specialization</label>
              <select className="form-select" name="specialization"
                value={form.specialization} onChange={handleChange} required>
                <option value="">Select department</option>
                {SPECIALIZATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Experience (years)</label>
              <input type="number" className="form-control" name="experience"
                value={form.experience} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small">Qualification</label>
              <input type="text" className="form-control" name="qualification"
                placeholder="e.g. MD Cardiology" value={form.qualification}
                onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Hospital Name</label>
              <input type="text" className="form-control" name="hospitalname"
                value={form.hospitalname} onChange={handleChange} required />
            </div>

          </div>

          <button type="submit" className="btn w-100 py-2 fw-bold text-white mt-4"
            style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)', borderRadius:'10px'}}
            disabled={loading}>
            {loading ? 'Registering...' : 'Register Doctor'}
          </button>
        </form>
      </div>
    </div>
  )
}