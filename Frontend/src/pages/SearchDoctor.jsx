import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

  const fetchBySpecialization = (dept) => {
    setSelected(dept);
    setLoading(true);
    setMsg('');
    const url = dept
      ? `http://localhost:8082/api/doctors?specialization=${encodeURIComponent(dept)}`
      : `http://localhost:8082/api/doctors`;

    fetch(url)
      .then(async (resp) => {
        if (!resp.ok) throw new Error('Request failed');
        return resp.json();
      })
      .then((data) => {
        setLoading(false);
        if (data.length === 0) setMsg('No doctors found for selected specialization.');
        else setMsg('');
        setDoctors(data);
      })
      .catch(() => { setLoading(false); setMsg('Could not fetch doctors.'); });
  }

  useEffect(() => {
    let ignore = false;
    fetch(`http://localhost:8082/api/doctors`)
      .then(async (resp) => {
        if (!resp.ok) throw new Error('Request failed');
        return resp.json();
      })
      .then((data) => {
        if (ignore) return;
        setLoading(false);
        if (data.length === 0) setMsg('No doctors found.');
        else setMsg('');
        setDoctors(data);
      })
      .catch(() => {
        if (ignore) return;
        setLoading(false);
        setMsg('Could not fetch doctors.');
      });
    return () => { ignore = true; };
  }, [])

  return (
    <div style={{minHeight:'100vh', padding:'8px'}}>

      {/* PAGE HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-1" style={{color:'var(--navy-dark)'}}>Find & Book Doctors</h3>
          <p className="text-muted small mb-0">Browse top verified medical specialists and book consultation slots instantly</p>
        </div>
        <span className="badge badge-status badge-completed fs-6">
          {doctors.length} Doctors Available
        </span>
      </div>

      {/* DEPARTMENT QUICK FILTER CHIPS */}
      <div className="card glass-card p-3 mb-4">
        <div className="d-flex align-items-center gap-2 overflow-auto pb-1" style={{scrollbarWidth:'none'}}>
          <button
            className={`btn btn-sm px-3 fw-semibold text-nowrap rounded-pill ${selected === '' ? 'btn-cyan-gradient' : 'btn-outline-secondary'}`}
            onClick={() => fetchBySpecialization('')}>
            All Departments
          </button>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              className={`btn btn-sm px-3 fw-semibold text-nowrap rounded-pill ${selected === dept ? 'btn-cyan-gradient' : 'btn-outline-secondary'}`}
              onClick={() => fetchBySpecialization(dept)}>
              {dept}
            </button>
          ))}
        </div>
      </div>

      {msg && <div className="alert alert-info py-2.5 rounded-3">{msg}</div>}

      {/* DOCTOR CARDS GRID */}
      <div className="row g-4">
        {doctors.map((doc) => {
          const nameParts = (doc.doctorName || 'Unknown').trim().split(' ');
          const initials = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();

          return (
            <div className="col-md-4" key={doc.doctorId}>
              <div className="card glass-card h-100 overflow-hidden">

                {/* DOCTOR CARD HEADER */}
                <div className="p-4 text-white" style={{background:'var(--blue-gradient)'}}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm"
                      style={{width:'56px', height:'56px', flexShrink:0, color:'var(--blue-primary)'}}>
                      {initials}
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-white">{doc.doctorName}</h5>
                      <span className="badge bg-white text-dark fw-semibold small mt-1">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DOCTOR CARD BODY */}
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div className="mb-3">
                    <div className="mb-2.5 d-flex justify-content-between align-items-center small">
                      <span className="text-muted">Hospital</span>
                      <span className="fw-semibold text-dark">{doc.hospital?.hospitalName || 'CityCare Hospital'}</span>
                    </div>
                    <div className="mb-2.5 d-flex justify-content-between align-items-center small">
                      <span className="text-muted">Qualification</span>
                      <span className="fw-semibold text-dark">{doc.degree || 'MBBS, MD'}</span>
                    </div>
                    <div className="mb-2.5 d-flex justify-content-between align-items-center small">
                      <span className="text-muted">Experience</span>
                      <span className="fw-semibold text-dark">{doc.experienceYears ?? 10} Years</span>
                    </div>
                  </div>

                  <button className="btn btn-cyan-gradient w-100 py-2.5 fw-bold mt-2"
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
