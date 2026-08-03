import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { APPOINTMENT_API } from '../api'

export default function AddPrescription() {
  const { state } = useLocation()
  const appointment = state?.appointment
  const navigate = useNavigate()

  const [diagnosis, setDiagnosis] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [medicines, setMedicines] = useState([
    { nameofmedicine: '', dosage: '', timing: '', comment: '' }
  ])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  const addMedicineRow = () => {
    setMedicines([...medicines, { nameofmedicine: '', dosage: '', timing: '', comment: '' }])
  }

  const removeMedicineRow = (index) => {
    if (medicines.length === 1) return
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!appointment) {
      setMsg('No appointment selected.')
      return
    }

    setLoading(true)
    setMsg('')

    const payload = {
      appointmentid: appointment.appointmentid,
      whatWasDiagnosed: diagnosis,
      followupdate: followUpDate || null,
      medicines: medicines.filter(m => m.nameofmedicine.trim() !== '')
    }

    fetch(`${APPOINTMENT_API}/prescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (resp) => {
        setLoading(false)
        if (resp.ok) {
          setMsg('✓ Prescription added successfully! Appointment marked complete.')
          setTimeout(() => navigate('/doctor-dashboard/appointments'), 1500)
        } else {
          const data = await resp.json()
          setMsg(data.message || 'Failed to add prescription.')
        }
      })
      .catch(() => {
        setLoading(false)
        setMsg('Could not connect to server.')
      })
  }

  return (
    <div style={{maxWidth:'820px'}}>
      <button className="btn btn-outline-secondary btn-sm mb-3 rounded-pill px-3"
        onClick={() => navigate('/doctor-dashboard/appointments')}>
        ← Back to Appointments
      </button>

      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{color:'var(--navy-dark)'}}>Digital Prescription Form</h3>
        <p className="text-muted small">Record clinical diagnosis, follow-up dates, and prescribed medication regimen</p>
      </div>

      {appointment && (
        <div className="card glass-card p-4 mb-4" style={{borderLeft:'5px solid var(--cyan-accent)', background:'rgba(240,249,255,0.95)'}}>
          <div className="row small">
            <div className="col-md-4">
              <span className="text-muted">Patient Name</span>
              <h6 className="fw-bold mb-0 text-dark">{appointment.patientfirst} {appointment.patientlast}</h6>
            </div>
            <div className="col-md-4">
              <span className="text-muted">Appointment Date</span>
              <h6 className="fw-bold mb-0 text-dark">{appointment.appointmentdate?.split('T')[0]}</h6>
            </div>
            <div className="col-md-4">
              <span className="text-muted">Chief Complaint / Reason</span>
              <h6 className="fw-bold mb-0 text-dark">{appointment.reason || '—'}</h6>
            </div>
          </div>
        </div>
      )}

      {msg && <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-danger'} py-2.5 rounded-3`}>{msg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card glass-card p-4 mb-4">
          <h5 className="fw-bold mb-3" style={{color:'var(--navy-dark)'}}>1. Clinical Diagnosis</h5>
          
          <div className="mb-3">
            <label className="form-label fw-semibold small text-dark">What was diagnosed?</label>
            <textarea className="form-control" rows="3"
              placeholder="e.g. Mild Hypertension & Acute Pharyngitis"
              value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
          </div>

          <div className="mb-3" style={{maxWidth:'300px'}}>
            <label className="form-label fw-semibold small text-dark">Follow-up Date (Optional)</label>
            <input type="date" className="form-control"
              value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
        </div>

        {/* MEDICINES SECTION */}
        <div className="card glass-card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{color:'var(--navy-dark)'}}>2. Prescribed Medications</h5>
            <button type="button" className="btn btn-sm btn-cyan-gradient px-3"
              onClick={addMedicineRow}>
              + Add Medicine
            </button>
          </div>

          {medicines.map((med, idx) => (
            <div key={idx} className="border rounded-3 p-3 mb-3" style={{background:'rgba(248,250,252,0.9)'}}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge badge-status badge-completed">Medicine #{idx + 1}</span>
                {medicines.length > 1 && (
                  <button type="button" className="btn btn-sm btn-link text-danger p-0 fw-semibold text-decoration-none"
                    onClick={() => removeMedicineRow(idx)}>
                    ✕ Remove
                  </button>
                )}
              </div>

              <div className="row g-2">
                <div className="col-md-6">
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                    value={med.nameofmedicine}
                    onChange={(e) => handleMedicineChange(idx, 'nameofmedicine', e.target.value)} required />
                </div>
                <div className="col-md-3">
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Dosage (e.g. 1 Tablet)"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Timing (e.g. Twice Daily)"
                    value={med.timing}
                    onChange={(e) => handleMedicineChange(idx, 'timing', e.target.value)} />
                </div>
                <div className="col-12 mt-2">
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Instructions / Comments (e.g. Take after breakfast)"
                    value={med.comment}
                    onChange={(e) => handleMedicineChange(idx, 'comment', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-cyan-gradient fs-6 fw-bold px-5 py-2.5" disabled={loading}>
          {loading ? 'Saving Prescription...' : 'Save & Issue Digital Prescription'}
        </button>
      </form>
    </div>
  )
}