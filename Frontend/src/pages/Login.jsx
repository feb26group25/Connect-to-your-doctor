import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { loginSuccess } from "../redux/authSlice";
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginComp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    fetch("http://localhost:8081/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim()
      }),
    })
      .then(async (resp) => {
        const data = await resp.json();
        if (!resp.ok) {
          setMsg(data.message || "Invalid email or password.");
          setLoading(false);
          return null;
        }
        return data;
      })
      .then((data) => {
        if (!data) return;
        const user = {
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
        };
        dispatch(loginSuccess({ user, token: data.token }));
        setLoading(false);
        if (data.role === "Admin") navigate("/admin-dashboard/appointments");
        else if (data.role === "Doctor") navigate("/doctor-dashboard/appointments");
        else if (data.role === "Patient") navigate("/user-dashboard/search");
        else navigate("/");
      })
      .catch(() => {
        setMsg("Something went wrong. Please try again.");
        setLoading(false);
      });
  };

  return (
    <div style={{minHeight:'100vh', background:'var(--dark-gradient)', display:'flex', flexDirection:'column'}}>

      {/* NAVBAR */}
      <nav className="navbar px-4 shadow-sm" style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold fs-5"
            style={{width:'38px', height:'38px', background:'var(--blue-gradient)'}}>
            +
          </div>
          <NavLink to="/" className="navbar-brand fw-bold text-white fs-4 mb-0">ConnectDoc</NavLink>
        </div>
      </nav>

      {/* CARD */}
      <div className="d-flex align-items-center justify-content-center flex-grow-1 py-5 px-3">
        <div className="card glass-card border-0 shadow-lg p-5"
          style={{width:'100%', maxWidth:'420px', background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)'}}>

          <div className="text-center mb-4">
            <div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold mb-3 fs-4 shadow-sm"
              style={{width:'60px', height:'60px', background:'var(--blue-gradient)'}}>
              +
            </div>
            <h4 className="fw-bold mb-1" style={{color:'var(--navy-dark)'}}>Welcome Back</h4>
            <p className="text-muted small">Sign in to your ConnectDoc account</p>
          </div>

          {msg && <div className="alert alert-danger py-2 text-center small rounded-3">{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-dark">Email Address</label>
              <input
                type="email"
                className="form-control py-2"
                placeholder="enter@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold small text-dark">Password</label>
              <div className="input-group">
                <input
                  type={showPw ? "text" : "password"}
                  className="form-control py-2"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.trim())}
                  required />
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setShowPw(!showPw)}>
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-cyan-gradient w-100 py-2.5 fw-bold text-white fs-6"
              disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Don't have an account?{' '}
            <NavLink to="/register" className="fw-bold" style={{color:'var(--accent-blue)'}}>
              Register here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  )
}