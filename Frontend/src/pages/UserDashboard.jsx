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
    <div style={{minHeight:'100vh', background:'#f0f4ff'}}>

      {/* NAVBAR */}
      <nav className="navbar px-4 shadow-sm"
        style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
        <span className="navbar-brand fw-bold text-white fs-4">ConnectDoc</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-white small opacity-75">
            Welcome, <b>{user?.username}</b>
          </span>
          <button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="d-flex">

        {/* SIDEBAR */}
        <div className="bg-white shadow-sm pt-4 px-3"
          style={{minWidth:'220px', minHeight:'calc(100vh - 58px)'}}>
          <p className="text-muted small fw-bold px-2 mb-3 text-uppercase">Menu</p>
          <ul className="nav flex-column gap-1">
            <li>
              <NavLink to="/user-dashboard/search"
                className={({isActive}) =>
                  `nav-link px-3 py-2 rounded fw-semibold ${isActive
                    ? 'text-white'
                    : 'text-dark'}`}
                style={({isActive}) =>
                  isActive ? {background:'linear-gradient(135deg, #1a3c8f, #2563eb)'} : {}}>
                Search Doctor
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-dashboard/myappointments"
                className={({isActive}) =>
                  `nav-link px-3 py-2 rounded fw-semibold ${isActive
                    ? 'text-white'
                    : 'text-dark'}`}
                style={({isActive}) =>
                  isActive ? {background:'linear-gradient(135deg, #1a3c8f, #2563eb)'} : {}}>
                My Appointments
              </NavLink>
            </li>
          </ul>
        </div>

        {/* CONTENT */}
        <div className="flex-grow-1 p-4">
          <Outlet />
        </div>

      </div>
    </div>
  )
}