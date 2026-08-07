import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { USER_API, DOCTOR_API, SPECIALIZATIONS, authHeaders } from '../api'
import { loginSuccess } from '../redux/authSlice'

const GENDERS = ['Male', 'Female', 'Other']

export default function DoctorProfile() {
  const { user, token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [personal, setPersonal] = useState({ name: '', mobileNumber: '', gender: '', city: '', state: '' })
  const [email, setEmail] = useState('')

  const [professional, setProfessional] = useState({
    specialization: '', degree: '', experienceYears: '', consultationFee: '', hospitalId: ''
  })
  const [doctorId, setDoctorId] = useState(null)
  const [hospitals, setHospitals] = useState([])

  const [loading, setLoading] = useState(true)
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [savingProfessional, setSavingProfessional] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  useEffect(() => {
    if (!user?.userId) return

    Promise.all([
      fetch(`${USER_API}/api/users/${user.userId}`, { headers: authHeaders() }).then((r) => r.json()),
      fetch(`${DOCTOR_API}/api/doctors/${user.userId}`, { headers: authHeaders() }).then((r) => r.ok ? r.json() : null),
      fetch(`${DOCTOR_API}/api/hospitals`).then((r) => r.json()).catch(() => []),
    ]).then(([userData, doctorData, hospitalList]) => {
      setPersonal({
        name: userData.name || '',
        mobileNumber: userData.mobileNumber || '',
        gender: userData.gender || '',
        city: userData.city || '',
        state: userData.state || '',
      })
      setEmail(userData.email || '')

      if (doctorData) {
        setDoctorId(doctorData.doctorId)
        setProfessional({
          specialization: doctorData.specialization || '',
          degree: doctorData.degree || '',
          experienceYears: doctorData.experienceYears ?? '',
          consultationFee: doctorData.consultationFee ?? '',
          hospitalId: doctorData.hospital?.hospitalId || '',
        })
      }

      setHospitals(hospitalList || [])
      setLoading(false)
    }).catch(() => {
      setMsg('Could not load your profile.')
      setMsgType('error')
      setLoading(false)
    })
  }, [user?.userId])

  const savePersonal = (e) => {
    e.preventDefault()
    setSavingPersonal(true)
    setMsg('')
    fetch(`${USER_API}/api/users/${user.userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(personal),
    })
      .then(async (resp) => {
        const data = await resp.json()
        setSavingPersonal(false)
        if (!resp.ok) {
          setMsg(data.message || 'Could not update personal details.')
          setMsgType('error')
          return
        }
        setMsg('Personal details updated!')
        setMsgType('success')
        dispatch(loginSuccess({ user: { ...user, name: data.name }, token }))
      })
      .catch(() => {
        setSavingPersonal(false)
        setMsg('Something went wrong. Please try again.')
        setMsgType('error')
      })
  }

  const saveProfessional = (e) => {
    e.preventDefault()
    if (!doctorId) {
      setMsg('No doctor profile found for your account yet — contact an Admin.')
      setMsgType('error')
      return
    }
    setSavingProfessional(true)
    setMsg('')
    fetch(`${DOCTOR_API}/api/doctors/${doctorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(professional),
    })
      .then(async (resp) => {
        const data = await resp.json()
        setSavingProfessional(false)
        if (!resp.ok) {
          setMsg(data.message || 'Could not update professional details.')
          setMsgType('error')
          return
        }
        setMsg('Professional details updated!')
        setMsgType('success')
      })
      .catch(() => {
        setSavingProfessional(false)
        setMsg('Something went wrong. Please try again.')
        setMsgType('error')
      })
  }

  if (loading) {
    return <p className="text-muted small">Loading your profile…</p>
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--navy-dark)' }}>My Profile</h4>
        <p className="text-muted small">Keep your personal and professional details up to date</p>
      </div>

      {msg && (
        <div className={`alert py-2 small rounded-3 ${msgType === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ maxWidth: '640px' }}>
          {msg}
        </div>
      )}

      <div className="row g-4">

        {/* PERSONAL INFO */}
        <div className="col-lg-6">
          <div className="card glass-card border-0 p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{ width: '58px', height: '58px', background: 'var(--blue-gradient)', flexShrink: 0 }}>
                {(personal.name || 'D').trim().charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="fw-bold mb-0">{personal.name || 'Your Name'}</h6>
                <p className="text-muted small mb-0">{email}</p>
              </div>
            </div>

            <form onSubmit={savePersonal}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark">Full Name</label>
                <input type="text" className="form-control" value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark">Mobile Number</label>
                <input type="text" className="form-control" value={personal.mobileNumber}
                  onChange={(e) => setPersonal({ ...personal, mobileNumber: e.target.value })} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small text-dark">Gender</label>
                  <select className="form-select" value={personal.gender}
                    onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}>
                    <option value="">Select</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small text-dark">City</label>
                  <input type="text" className="form-control" value={personal.city}
                    onChange={(e) => setPersonal({ ...personal, city: e.target.value })} />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold small text-dark">State</label>
                <input type="text" className="form-control" value={personal.state}
                  onChange={(e) => setPersonal({ ...personal, state: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-cyan-gradient w-100 py-2 fw-bold" disabled={savingPersonal}>
                {savingPersonal ? 'Saving…' : 'Save Personal Details'}
              </button>
            </form>
          </div>
        </div>

        {/* PROFESSIONAL INFO */}
        <div className="col-lg-6">
          <div className="card glass-card border-0 p-4 h-100">
            <h6 className="fw-bold mb-4" style={{ color: 'var(--navy-dark)' }}>Professional Details</h6>

            {!doctorId ? (
              <div className="alert alert-warning small">
                No doctor profile is linked to your account yet. Please contact an Admin to get set up.
              </div>
            ) : (
              <form onSubmit={saveProfessional}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">Specialization</label>
                  <select className="form-select" value={professional.specialization}
                    onChange={(e) => setProfessional({ ...professional, specialization: e.target.value })} required>
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">Degree / Qualification</label>
                  <input type="text" className="form-control" placeholder="e.g. MD Cardiology"
                    value={professional.degree}
                    onChange={(e) => setProfessional({ ...professional, degree: e.target.value })} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold small text-dark">Experience (years)</label>
                    <input type="number" min="0" className="form-control" value={professional.experienceYears}
                      onChange={(e) => setProfessional({ ...professional, experienceYears: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small text-dark">Consultation Fee (₹)</label>
                    <input type="number" min="0" className="form-control" value={professional.consultationFee}
                      onChange={(e) => setProfessional({ ...professional, consultationFee: e.target.value })} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-dark">Hospital</label>
                  <select className="form-select" value={professional.hospitalId}
                    onChange={(e) => setProfessional({ ...professional, hospitalId: e.target.value })}>
                    <option value="">Select hospital</option>
                    {hospitals.map((h) => (
                      <option key={h.hospitalId} value={h.hospitalId}>{h.hospitalName}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-cyan-gradient w-100 py-2 fw-bold" disabled={savingProfessional}>
                  {savingProfessional ? 'Saving…' : 'Save Professional Details'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
