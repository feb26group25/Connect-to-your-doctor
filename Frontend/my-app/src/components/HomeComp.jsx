import { NavLink, Outlet } from 'react-router-dom';

export default function HomeComp() {
  return (
    <div style={{minHeight:'100vh', background:'var(--bg-main)', display:'flex', flexDirection:'column'}}>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg px-3 px-md-4 shadow-sm"
        style={{background:'var(--dark-gradient)', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold fs-5"
              style={{width:'38px', height:'38px', background:'var(--blue-gradient)'}}>
              +
            </div>
            <span className="navbar-brand fw-bold text-white fs-4 mb-0">ConnectDoc</span>
          </div>

          <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
            <NavLink to="/login" className="btn btn-outline-light btn-sm px-3 px-md-4 fw-semibold" style={{borderRadius:'10px'}}>
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-cyan-gradient btn-sm px-3 px-md-4 fw-semibold">
              Register
            </NavLink>
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH DOCTOR IMAGE & BADGES */}
      <div className="py-5 px-3" style={{background:'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', color:'#fff'}}>
        <div className="container py-3">
          <div className="row align-items-center g-4">
            
            {/* HERO LEFT COLUMN */}
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge rounded-pill px-3 py-2 mb-3 fw-bold d-inline-block"
                style={{background:'rgba(6,182,212,0.15)', color:'#38bdf8', border:'1px solid rgba(6,182,212,0.3)', letterSpacing:'0.05em'}}>
                🩺 24/7 ONLINE HEALTHCARE CONSULTATION
              </span>
              <h1 className="display-5 hero-heading fw-bold mb-3 text-white">
                Find Top Doctors & <br className="d-none d-md-inline" />Book Appointments Instantly.
              </h1>
              <p className="lead mb-4 text-slate-300" style={{color:'#94a3b8', fontSize:'1.1rem'}}>
                ConnectDoc bridges patients with top certified doctors across India. Book real-time appointment slots, receive digital prescriptions, and rate your medical care seamlessly.
              </p>

              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mb-4">
                <NavLink to="/login" className="btn btn-cyan-gradient px-4 py-2.5 fs-6 fw-bold">
                  Book Appointment Now
                </NavLink>
                <NavLink to="/register" className="btn btn-outline-light px-4 py-2.5 fs-6 fw-semibold" style={{borderRadius:'12px'}}>
                  Join as Patient / Doctor
                </NavLink>
              </div>

              {/* STATS STRIP */}
              <div className="d-flex justify-content-center justify-content-lg-start gap-4 pt-2 border-top border-secondary opacity-75">
                <div>
                  <h4 className="fw-bold mb-0 text-cyan-400" style={{color:'#38bdf8'}}>100+</h4>
                  <span className="small text-muted" style={{color:'#94a3b8'}}>Expert Doctors</span>
                </div>
                <div>
                  <h4 className="fw-bold mb-0" style={{color:'#38bdf8'}}>50+</h4>
                  <span className="small text-muted" style={{color:'#94a3b8'}}>Partner Hospitals</span>
                </div>
                <div>
                  <h4 className="fw-bold mb-0" style={{color:'#38bdf8'}}>4.9 ★</h4>
                  <span className="small text-muted" style={{color:'#94a3b8'}}>Patient Rating</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT COLUMN (PHOTOS & FLOATING CARDS) */}
            <div className="col-lg-6 text-center hero-img-container">
              <div className="position-relative d-inline-block w-100" style={{maxWidth:'500px'}}>
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
                  alt="Doctor Consultation"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{border:'3px solid rgba(255,255,255,0.15)', maxHeight:'420px', width:'100%', objectFit:'cover'}}
                />

                {/* FLOATING BADGE 1 */}
                <div className="position-absolute glass-card p-2 px-3 d-flex align-items-center gap-2 shadow-lg"
                  style={{top:'20px', left:'-10px', background:'rgba(15,23,42,0.9)', color:'#fff', borderRadius:'12px', border:'1px solid rgba(6,182,212,0.4)'}}>
                  <span className="fs-5">⭐</span>
                  <div className="text-start">
                    <span className="fw-bold d-block small">Top Rated Clinic</span>
                    <span className="small text-muted" style={{color:'#94a3b8', fontSize:'0.75rem'}}>Verified Specialist</span>
                  </div>
                </div>

                {/* FLOATING BADGE 2 */}
                <div className="position-absolute glass-card p-2 px-3 d-flex align-items-center gap-2 shadow-lg"
                  style={{bottom:'20px', right:'-10px', background:'rgba(255,255,255,0.95)', color:'#0f172a', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                  <span className="fs-5">💊</span>
                  <div className="text-start">
                    <span className="fw-bold d-block small">Instant Digital Rx</span>
                    <span className="small text-muted" style={{fontSize:'0.75rem'}}>Medication Schedule</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MEDICAL SERVICES & SPECIALTY CARDS WITH PHOTOS */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-2" style={{color:'var(--navy-dark)'}}>Complete Healthcare Platform</h2>
          <p className="text-muted mx-auto" style={{maxWidth:'600px'}}>Designed for patients, medical professionals, and hospital administrators</p>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="card glass-card h-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                alt="Doctor Appointment"
                style={{height:'180px', objectFit:'cover'}}
              />
              <div className="card-body p-4 text-center">
                <h5 className="fw-bold mb-2" style={{color:'var(--navy-dark)'}}>Specialist Consultation</h5>
                <p className="text-muted small mb-3">
                  Search doctors by department—Cardiology, Neurology, Pediatrics, Dermatology, General Medicine, and more.
                </p>
                <NavLink to="/login" className="btn btn-sm btn-cyan-gradient px-3 py-2 fw-semibold">
                  Browse Doctors →
                </NavLink>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card glass-card h-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                alt="Hospital Facility"
                style={{height:'180px', objectFit:'cover'}}
              />
              <div className="card-body p-4 text-center">
                <h5 className="fw-bold mb-2" style={{color:'var(--navy-dark)'}}>Partner Hospitals</h5>
                <p className="text-muted small mb-3">
                  Connect with accredited medical centers and hospitals equipped with modern diagnostics and emergency care.
                </p>
                <NavLink to="/login" className="btn btn-sm btn-cyan-gradient px-3 py-2 fw-semibold">
                  View Hospitals →
                </NavLink>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card glass-card h-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80"
                alt="Prescription Care"
                style={{height:'180px', objectFit:'cover'}}
              />
              <div className="card-body p-4 text-center">
                <h5 className="fw-bold mb-2" style={{color:'var(--navy-dark)'}}>Digital Prescriptions & Rx</h5>
                <p className="text-muted small mb-3">
                  Doctors generate electronic prescriptions with dosage, timing, and follow-up alerts directly saved to patient portal.
                </p>
                <NavLink to="/login" className="btn btn-sm btn-cyan-gradient px-3 py-2 fw-semibold">
                  Access Portal →
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Outlet />
        </div>
      </div>

    </div>
  );
}