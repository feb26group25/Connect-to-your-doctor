import { NavLink } from "react-router-dom"

export default function Home() {
  return (
    <div style={{fontFamily:'Segoe UI, sans-serif'}}>

      {/* NAVBAR - same as dashboards */}
      <nav className="navbar px-4 shadow-sm"
        style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
        <span className="navbar-brand fw-bold text-white fs-4">ConnectDoc</span>
        <div className="ms-auto d-flex gap-2">
          <NavLink to="/login" className="btn btn-outline-light px-4">Login</NavLink>
          <NavLink to="/register" className="btn btn-light px-4 fw-bold" style={{color:'#1a3c8f'}}>Register</NavLink>
        </div>
      </nav>

      {/* HERO */}
      <div className="text-white text-center py-5"
        style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)', minHeight:'420px', display:'flex', alignItems:'center'}}>
        <div className="container py-4">
          <h1 className="display-4 fw-bold mb-3">Your Health, Our Priority</h1>
          <p className="fs-5 mb-4 opacity-75">Find doctors, book appointments and manage your health online.</p>
          <NavLink to="/register" className="btn btn-light fw-bold px-5 py-2 me-3" style={{color:'#1a3c8f', borderRadius:'10px'}}>
            Get Started
          </NavLink>
          <NavLink to="/login" className="btn btn-outline-light px-5 py-2" style={{borderRadius:'10px'}}>
            Login
          </NavLink>
        </div>
      </div>

      {/* STATS */}
      <div className="bg-white py-4 shadow-sm">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 py-3">
              <h3 className="fw-bold" style={{color:'#1a3c8f'}}>50+</h3>
              <p className="text-muted mb-0">Doctors Available</p>
            </div>
            <div className="col-md-4 py-3 border-start border-end">
              <h3 className="fw-bold" style={{color:'#1a3c8f'}}>8+</h3>
              <p className="text-muted mb-0">Specializations</p>
            </div>
            <div className="col-md-4 py-3">
              <h3 className="fw-bold" style={{color:'#1a3c8f'}}>1000+</h3>
              <p className="text-muted mb-0">Appointments Booked</p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-5" style={{background:'#f0f4ff'}}>
        <div className="container">
          <h2 className="text-center fw-bold mb-2">How It Works</h2>
          <p className="text-center text-muted mb-5">3 simple steps to connect with your doctor</p>
          <div className="row g-4">
            {[
              {step:'1', title:'Register', desc:'Create your free account as a patient in minutes.'},
              {step:'2', title:'Search Doctor', desc:'Find the right doctor by department or specialization.'},
              {step:'3', title:'Book Appointment', desc:'Select date and time and confirm your booking instantly.'},
            ].map(s => (
              <div className="col-md-4" key={s.step}>
                <div className="card border-0 shadow-sm p-4 h-100 text-center" style={{borderRadius:'16px'}}>
                  <div className="rounded-circle text-white fw-bold fs-4 mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{width:'52px', height:'52px', background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
                    {s.step}
                  </div>
                  <h5 className="fw-bold">{s.title}</h5>
                  <p className="text-muted mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEPARTMENTS */}
      <div className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center fw-bold mb-2">Our Departments</h2>
          <p className="text-center text-muted mb-5">We cover all major medical specializations</p>
          <div className="row g-3">
            {['Cardiology','Dermatology','Orthopedics','Neurology','Pediatrics','Ophthalmology','ENT','General Medicine'].map(d => (
              <div className="col-6 col-md-3" key={d}>
                <div className="card border-0 shadow-sm text-center p-3" style={{borderRadius:'12px'}}>
                  <p className="fw-bold mb-0" style={{color:'#1a3c8f'}}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-white text-center py-5"
        style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
        <div className="container">
          <h3 className="fw-bold mb-3">Ready to book your appointment?</h3>
          <NavLink to="/register" className="btn btn-light fw-bold px-5 py-2" style={{color:'#1a3c8f', borderRadius:'10px'}}>
            Create Free Account
          </NavLink>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0 text-muted small">© 2026 ConnectDoc — CDAC Project</p>
      </footer>

    </div>
  )
}