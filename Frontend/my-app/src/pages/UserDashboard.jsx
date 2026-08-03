import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../redux/authSlice"

export default function UserDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc'}}>

      {/* NAVBAR */}
      <nav className="navbar px-3 px-md-4 shadow-sm"
        style={{background:'var(--dark-gradient)', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold fs-5"
            style={{width:'38px', height:'38px', background:'var(--blue-gradient)'}}>
            +
          </div>
          <span className="navbar-brand fw-bold text-white fs-5 fs-md-4 mb-0">ConnectDoc</span>
        </div>
        <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
          <div className="px-2 px-md-3 py-1 rounded-pill" style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)'}}>
            <span className="text-white small">
              Welcome, <b style={{color:'#38bdf8'}}>{user?.name || user?.username || 'User'}</b>
            </span>
          </div>
          <button className="btn btn-outline-light btn-sm px-2 px-md-3 fw-semibold" style={{borderRadius:'10px'}} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* LAYOUT CONTAINER */}
      <div className="d-flex dashboard-layout">

        {/* SIDEBAR */}
        <div className="bg-white shadow-sm pt-3 pt-md-4 px-3 dashboard-sidebar"
          style={{minWidth:'240px', minHeight:'calc(100vh - 60px)', borderRight:'1px solid #e2e8f0'}}>
          <p className="text-muted small fw-bold px-2 mb-2 mb-md-3 text-uppercase" style={{letterSpacing:'0.05em'}}>Patient Portal</p>
          <ul className="nav flex-column gap-2">
            <li>
              <NavLink to="/user-dashboard/search"
                className={({isActive}) =>
                  `nav-link px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 ${isActive ? 'text-white' : 'text-dark'}`}
                style={({isActive}) =>
                  isActive ? {background:'var(--blue-gradient)', boxShadow:'0 4px 14px rgba(6,182,212,0.3)'} : {}}>
                <span>🔍</span> Search Doctor
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-dashboard/myappointments"
                className={({isActive}) =>
                  `nav-link px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 ${isActive ? 'text-white' : 'text-dark'}`}
                style={({isActive}) =>
                  isActive ? {background:'var(--blue-gradient)', boxShadow:'0 4px 14px rgba(6,182,212,0.3)'} : {}}>
                <span>📋</span> My Appointments
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-dashboard/profile"
                className={({isActive}) =>
                  `nav-link px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 ${isActive ? 'text-white' : 'text-dark'}`}
                style={({isActive}) =>
                  isActive ? {background:'var(--blue-gradient)', boxShadow:'0 4px 14px rgba(6,182,212,0.3)'} : {}}>
                <span>👤</span> My Profile
              </NavLink>
            </li>
          </ul>
        </div>

        {/* CONTENT */}
        <div className="flex-grow-1 p-3 p-md-4">
          <Outlet />
        </div>

      </div>
    </div>
  )
}