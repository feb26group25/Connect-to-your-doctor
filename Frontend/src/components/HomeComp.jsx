export default function HomeComp()
{
    return(
        <>
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
         <div className="container-fluid">
          <span className="navbar-brand">My App</span>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">
                Login
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/register">
                Register
              </NavLink>
            </li>
           </ul>
          </div>
        </nav>

        <div className="container mt-4">
          <h1>Welcome to Home Page</h1>
          <Outlet />
        </div>

        </>
    )
}