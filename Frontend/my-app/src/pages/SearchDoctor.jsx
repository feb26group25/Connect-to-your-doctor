import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DOCTOR_API, APPOINTMENT_API, SPECIALIZATIONS as DEPARTMENTS } from '../api'

export default function SearchDoctor() {
  const [doctors, setDoctors] = useState([])
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [msg, setMsg] = useState('')
  const [ratings, setRatings] = useState({}) // doctorId -> { average, count }
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchDoctors = (dept = '') => {
    setLoading(true)
    setMsg('')
    const url = dept
      ? `${DOCTOR_API}/api/doctors?specialization=${encodeURIComponent(dept)}`
      : `${DOCTOR_API}/api/doctors`

    fetch(url)
      .then(async (resp) => {
        if (!resp.ok) throw new Error('Request failed')
        return resp.json()
      })
      .then((data) => {
        setLoading(false)
        if (!Array.isArray(data) || data.length === 0) {
          setMsg('No doctors found for the selected specialization.')
        } else {
          setMsg('')
        }
        // Deduplicate doctors by email or doctorName to guarantee strictly unique display
        const unique = []
        const seen = new Set()
        for (const doc of Array.isArray(data) ? data : []) {
          const key = (doc.email || doc.doctorName || String(doc.doctorId || doc.userId)).toLowerCase()
          if (!seen.has(key)) {
            seen.add(key)
            unique.push(doc)
          }
        }
        setDoctors(unique)
      })
      .catch(() => {
        setLoading(false)
        setMsg('Could not fetch doctors.')
      })
  }

  useEffect(() => {
    fetchDoctors(selectedSpecialization)
  }, [selectedSpecialization])

  // Pull each visible doctor's feedback and compute an average star rating
  useEffect(() => {
    let ignore = false
    if (doctors.length === 0) return

    Promise.all(
      doctors.map((doc) => {
        const dId = doc.doctorId || doc.userId
        return fetch(`${APPOINTMENT_API}/feedback/doctor/${dId}`)
          .then((resp) => (resp.ok ? resp.json() : []))
          .then((list) => ({ doctorId: dId, list }))
          .catch(() => ({ doctorId: dId, list: [] }))
      })
    ).then((results) => {
      if (ignore) return
      const next = {}
      for (const { doctorId, list } of results) {
        if (list.length > 0) {
          const avg = list.reduce((sum, f) => sum + (f.rating || 0), 0) / list.length
          next[doctorId] = { average: avg, count: list.length }
        }
      }
      setRatings(next)
    })

    return () => {
      ignore = true
    }
  }, [doctors])

  // Filter by search query (name or hospital)
  const filteredDoctors = doctors.filter((doc) => {
    const name = (doc.doctorName || '').toLowerCase()
    const hospital = (doc.hospital?.hospitalName || '').toLowerCase()
    const spec = (doc.specialization || '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return name.includes(q) || hospital.includes(q) || spec.includes(q)
  })

  return (
    <div style={{ minHeight: '100vh', padding: '12px' }}>
      {/* PAGE HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--navy-dark)' }}>
            Find & Book Doctors
          </h3>
          <p className="text-muted small mb-0">
            Select a medical specialization from the dropdown or search by name to book consultations
          </p>
        </div>
        <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">
          {filteredDoctors.length} Doctors Available
        </span>
      </div>

      {/* FILTER & DROPDOWN TOOLBAR */}
      <div className="card glass-card p-3 mb-4 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="row g-3 align-items-center">
          {/* SPECIALIZATION DROPDOWN */}
          <div className="col-md-6">
            <label className="form-label fw-bold small text-muted mb-1">
              Doctor Specialization
            </label>
            <select
              className="form-select form-select-lg"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              style={{
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}
            >
              <option value="">All Specializations (View All Doctors)</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH INPUT */}
          <div className="col-md-6">
            <label className="form-label fw-bold small text-muted mb-1">
              Search by Doctor or Hospital Name
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search by name, department, or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderRadius: searchQuery ? '10px 0 0 10px' : '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  style={{ borderRadius: '0 10px 10px 0' }}
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {msg && <div className="alert alert-info py-2.5 rounded-3">{msg}</div>}

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p>Loading doctors...</p>
        </div>
      )}

      {/* DOCTORS VERTICAL LIST (ONE BELOW ANOTHER) */}
      {!loading && filteredDoctors.length === 0 && (
        <div className="card glass-card text-center p-5 text-muted shadow-sm" style={{ borderRadius: '16px' }}>
          <h5>No doctors match your search</h5>
          <p className="small mb-3">Try selecting a different specialization from the dropdown above.</p>
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-4 mx-auto"
            onClick={() => {
              setSelectedSpecialization('')
              setSearchQuery('')
            }}
          >
            Reset Filter
          </button>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {filteredDoctors.map((doc) => {
          const docId = doc.doctorId || doc.userId
          const nameParts = (doc.doctorName || 'Doctor').trim().split(' ')
          const initials = (
            (nameParts[0]?.[0] || 'D') +
            (nameParts[nameParts.length - 1]?.[0] || 'R')
          ).toUpperCase()

          const docRating = ratings[docId]

          return (
            <div
              key={docId}
              className="card glass-card shadow-sm border-0"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                borderLeft: '5px solid #2563eb'
              }}
            >
              <div className="card-body p-4">
                <div className="row align-items-center g-3">
                  {/* DOCTOR AVATAR & BASIC INFO */}
                  <div className="col-lg-5 col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm"
                        style={{
                          width: '64px',
                          height: '64px',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, #1a3c8f, #2563eb)'
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1 text-dark">
                          {doc.doctorName?.startsWith('Dr.') ? doc.doctorName : `Dr. ${doc.doctorName}`}
                        </h5>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span
                            className="badge px-2.5 py-1.5 fw-semibold"
                            style={{
                              background: '#e0e7ff',
                              color: '#3730a3',
                              borderRadius: '6px'
                            }}
                          >
                            {doc.specialization || 'General Medicine'}
                          </span>
                          <span className="badge bg-light text-muted border">
                            {doc.degree || 'MBBS, MD'}
                          </span>
                        </div>
                        {docRating && (
                          <div className="mt-1.5 small text-primary fw-semibold">
                            Rating: {docRating.average.toFixed(1)} / 5.0
                            <span className="text-muted fw-normal ms-1">
                              ({docRating.count} patient review
                              {docRating.count === 1 ? '' : 's'})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CLINIC / EXPERIENCE DETAILS */}
                  <div className="col-lg-4 col-md-3">
                    <div className="small">
                      <div className="mb-1.5">
                        <span className="text-muted">Hospital: </span>
                        <strong className="text-dark">
                          {doc.hospital?.hospitalName || 'CityCare Hospital'}
                        </strong>
                      </div>
                      <div className="mb-1.5">
                        <span className="text-muted">Experience: </span>
                        <strong className="text-dark">
                          {doc.experienceYears ?? 10} Years
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted">Contact: </span>
                        <span className="text-dark font-monospace">
                          {doc.mobileNumber || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="col-lg-3 col-md-3 text-md-end">
                    <button
                      className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #1a3c8f, #2563eb)',
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                      onClick={() =>
                        navigate('/user-dashboard/book', { state: { doctor: doc } })
                      }
                    >
                      Book Appointment
                    </button>
                    <span className="text-muted d-block text-center mt-1 small" style={{ fontSize: '0.78rem' }}>
                      Instant Slot Confirmation
                    </span>
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
