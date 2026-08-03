import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { loginSuccess } from "../redux/authSlice";
import { USER_API } from '../api'

export default function Register() {
  const [form, setForm] = useState({
    firstname: "", lastname: "",
    email: "", contactnumber: "", password: ""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const payload = {
      name: `${form.firstname.trim()} ${form.lastname.trim()}`.trim(),
      email: form.email.trim(),
      mobileNumber: form.contactnumber.trim(),
      password: form.password,
      roleName: "Patient", // public self-registration is always a Patient;
                           // Doctors/Admins are added via the admin dashboard
    };

    fetch(`${USER_API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (resp) => {
        const data = await resp.json();
        setLoading(false);
        if (!resp.ok) {
          setMsg(data.message || "Registration failed. Email or mobile number may already exist.");
          return;
        }
        setSuccess(true);
        // backend already returns a valid JWT on register — log them straight in
        const user = { userId: data.userId, name: data.name, email: data.email, role: data.role };
        dispatch(loginSuccess({ user, token: data.token }));
        setTimeout(() => navigate("/user-dashboard/search"), 1200);
      })
      .catch(() => {
        setLoading(false);
        setMsg("Something went wrong. Please try again.");
      });
  };

  return (
    <div style={{minHeight:'100vh', background:'#f0f4ff', display:'flex', flexDirection:'column'}}>

      {/* NAVBAR */}
      <nav className="navbar px-4 shadow-sm"
        style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
        <NavLink to="/" className="navbar-brand fw-bold text-white fs-4">ConnectDoc</NavLink>
      </nav>

      {/* CARD */}
      <div className="d-flex align-items-center justify-content-center flex-grow-1 py-5">
        <div className="card border-0 shadow p-5" style={{width:'100%', maxWidth:'500px', borderRadius:'16px'}}>

          <div className="text-center mb-4">
            <div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold mb-3 fs-4"
              style={{width:'56px', height:'56px', background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
              +
            </div>
            <h4 className="fw-bold mb-1">Create Account</h4>
            <p className="text-muted small">Join ConnectDoc and start booking appointments</p>
          </div>

          {success && <div className="alert alert-success text-center small">Account created! Taking you to your dashboard...</div>}
          {msg && <div className="alert alert-danger py-2 text-center small">{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label fw-semibold small">First Name</label>
                <input type="text" className="form-control py-2" name="firstname"
                  placeholder="First name" value={form.firstname} onChange={handleChange} required />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small">Last Name</label>
                <input type="text" className="form-control py-2" name="lastname"
                  placeholder="Last name" value={form.lastname} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Email</label>
                <input type="email" className="form-control py-2" name="email"
                  placeholder="your@email.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Contact Number</label>
                <input type="text" className="form-control py-2" name="contactnumber"
                  placeholder="10-digit mobile number" value={form.contactnumber} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Password</label>
                <input type="password" className="form-control py-2" name="password"
                  placeholder="Create a password" value={form.password} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn w-100 py-2 fw-bold text-white mt-4"
              style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)', borderRadius:'10px'}}
              disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account? <NavLink to="/login" className="fw-bold" style={{color:'#1a3c8f'}}>Sign in here</NavLink>
          </p>
        </div>
      </div>
    </div>
  )
}