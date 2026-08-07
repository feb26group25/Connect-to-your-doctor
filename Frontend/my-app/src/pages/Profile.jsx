import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { USER_API, authHeaders } from '../api'
import { loginSuccess } from '../redux/authSlice'

const GENDERS = ['Male', 'Female', 'Other']

export default function Profile() {
  const { user, token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [form, setForm] = useState({
    name: '', mobileNumber: '', gender: '', city: '', state: ''
  })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  useEffect(() => {
    if (!user?.userId) return
    fetch(`${USER_API}/api/users/${user.userId}`, { headers: authHeaders() })
      .then((resp) => resp.json())
      .then((data) => {
        setForm({
          name: data.name || '',
          mobileNumber: data.mobileNumber || '',
          gender: data.gender || '',
          city: data.city || '',
          state: data.state || '',
        })
        setEmail(data.email || '')
        setLoading(false)
      })
      .catch(() => {
        setMsg('Could not load your profile.')
        setMsgType('error')
        setLoading(false)
      })
  }, [user?.userId])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    fetch(`${USER_API}/api/users/${user.userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(form),
    })
      .then(async (resp) => {
        const data = await resp.json()
        setSaving(false)
        if (!resp.ok) {
          setMsg(data.message || 'Could not update profile.')
          setMsgType('error')
          return
        }
        setMsg('Profile updated successfully!')
        setMsgType('success')
        // keep the navbar / redux copy of the name in sync immediately
        dispatch(loginSuccess({ user: { ...user, name: data.name }, token }))
      })
      .catch(() => {
        setSaving(false)
        setMsg('Something went wrong. Please try again.')
        setMsgType('error')
      })
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--navy-dark)' }}>My Profile</h4>
        <p className="text-muted small">Keep your personal details up to date</p>
      </div>

      <div className="card glass-card border-0 p-4" style={{ maxWidth: '640px' }}>

        {loading ? (
          <p className="text-muted small mb-0">Loading your profile…</p>
        ) : (
          <>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{ width: '64px', height: '64px', background: 'var(--blue-gradient)', flexShrink: 0 }}
              >
                {(form.name || 'U').trim().charAt(0).toUpperCase()}
              </div>
              <div>
                <h5 className="fw-bold mb-0">{form.name || 'Your Name'}</h5>
                <p className="text-muted small mb-0">{email}</p>
              </div>
            </div>

            {msg && (
              <div className={`alert py-2 small rounded-3 ${msgType === 'error' ? 'alert-danger' : 'alert-success'}`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Full Name</label>
                  <input type="text" className="form-control" name="name"
                    value={form.name} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Email</label>
                  <input type="email" className="form-control" value={email} disabled
                    title="Email cannot be changed here" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Mobile Number</label>
                  <input type="text" className="form-control" name="mobileNumber"
                    value={form.mobileNumber} onChange={handleChange} placeholder="10-digit mobile number" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">City</label>
                  <input type="text" className="form-control" name="city"
                    value={form.city} onChange={handleChange} placeholder="e.g. Pune" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">State</label>
                  <input type="text" className="form-control" name="state"
                    value={form.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
                </div>

              </div>

              <button type="submit" className="btn btn-cyan-gradient w-100 py-2 fw-bold mt-4" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
