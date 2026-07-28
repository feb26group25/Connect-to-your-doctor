import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Must match Doctor.Specialization enum values in doctor-service (spaces, not underscores,
// except where the enum constant itself has no space, e.g. Cardiologist).
const DEPARTMENTS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
  'Neurologist', 'Orthopedic', 'Gynecologist', 'Psychiatrist',
  'ENT', 'Ophthalmologist', 'Dental', 'Other'
]

export default function SearchDoctor() {
  const [doctors, setDoctors] = useState([])
  const [selected, setSelected] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const searchDoctors = () => {
    setLoading(true)
    setMsg('')
    const url = selected
      ? `http://localhost:8082/api/doctors?specialization=${encodeURIComponent(selected)}`
      : `http://localhost:8082/api/doctors`

    fetch(url)
      .then(async (resp) => {
        if (!resp.ok) throw new Error('Request failed');
        return resp.json();
      })
      .then((data) => {
        setLoading(false)
        if (data.length === 0) setMsg('No doctors found.')
        else setMsg('')
        setDoctors(data)
      })
      .catch(() => { setLoading(false); setMsg('Could not fetch doctors.') })
  }

  // run once on initial page load too, not just on button click
  useEffect(() => { searchDoctors() }, [])

  return (
    <div style={{background:'#f0f4ff', minHeight:'100vh', padding:'24px'}}>

      {/* HEADER */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{color:'#1a3c8f'}}>Search Doctor</h4>
        <p className="text-muted small">Find the right doctor by specialization</p>
      </div>

      {/* SEARCH BAR */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{borderRadius:'16px'}}>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label fw-semibold small">Select Department</label>
            <select className="form-select py-2" value={selected}
              onChange={(e) => setSelected(e.target.value)}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn w-100 py-2 fw-bold text-white"
              style={{background:'#1a3c8f', borderRadius:'10px'}}
              onClick={searchDoctors}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      {/* DOCTOR CARDS */}
      <div className="row g-4">
        {doctors.map((doc) => {
          const nameParts = (doc.doctorName || 'Unknown').trim().split(' ');
          const initials = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();

          return (
            <div className="col-md-4" key={doc.doctorId}>
              <div className="card border-0 shadow h-100"
                style={{borderRadius:'16px', overflow:'hidden'}}>

                {/* CARD TOP - BLUE HEADER */}
                <div className="p-4 text-white"
                  style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center fw-bold fs-5"
                      style={{width:'54px', height:'54px', color:'#1a3c8f', flexShrink:0}}>
                      {initials}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1 text-white">
                        {doc.doctorName}
                      </h6>
                      <span className="badge bg-white fw-semibold small"
                        style={{color:'#1a3c8f'}}>
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="card-body p-4">
                  <div className="mb-2 d-flex gap-2 small">
                    <span className="text-muted" style={{minWidth:'100px'}}>Hospital</span>
                    <span className="fw-semibold text-dark">{doc.hospital?.hospitalName || '—'}</span>
                  </div>
                  <div className="mb-2 d-flex gap-2 small">
                    <span className="text-muted" style={{minWidth:'100px'}}>Qualification</span>
                    <span className="fw-semibold text-dark">{doc.degree || '—'}</span>
                  </div>
                  <div className="mb-4 d-flex gap-2 small">
                    <span className="text-muted" style={{minWidth:'100px'}}>Experience</span>
                    <span className="fw-semibold text-dark">{doc.experienceYears ?? '—'} years</span>
                  </div>

                  <button className="btn w-100 fw-bold py-2 text-white"
                    style={{background:'#1a3c8f', borderRadius:'10px'}}
                    onClick={() => navigate('/user-dashboard/book', { state: { doctor: doc } })}>
                    Book Appointment
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
