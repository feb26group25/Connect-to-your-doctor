import { useEffect, useState } from 'react'

export default function AllUsers() {
  const [users, setUsers] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('http://localhost:9000/users')
      .then(resp => resp.json())
      .then(data => {
        if(data.length === 0) setMsg('No users found.')
        setUsers(data)
      })
      .catch(() => setMsg('Could not fetch users.'))
  }, [])

  const getRoleBadge = (roleid) => {
    if(roleid === 1) return {label:'Admin', bg:'#fdeaea', color:'#a81a1a'}
    if(roleid === 2) return {label:'Patient', bg:'#e8f4fd', color:'#1a6fa8'}
    if(roleid === 3) return {label:'Doctor', bg:'#e8fdf4', color:'#1a8a5a'}
    return {label:'Unknown', bg:'#f0f0f0', color:'#555'}
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{color:'#1a3c8f'}}>All Users</h4>
        <p className="text-muted small">Manage all registered users</p>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="card border-0 shadow-sm" style={{borderRadius:'16px', overflow:'hidden'}}>
        <div className="p-3 text-white d-flex align-items-center justify-content-between"
          style={{background:'linear-gradient(135deg, #1a3c8f, #2563eb)'}}>
          <span className="fw-bold">Users List</span>
          <span className="badge bg-white fw-semibold" style={{color:'#1a3c8f'}}>
            Total: {users.length}
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Username</th>
                <th className="py-3">Email</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const role = getRoleBadge(u.roleid)
                return (
                  <tr key={u.userid}>
                    <td className="py-3 px-4 text-muted small">{u.userid}</td>
                    <td className="py-3 fw-semibold">{u.firstname} {u.lastname}</td>
                    <td className="py-3 text-muted">{u.username}</td>
                    <td className="py-3 text-muted">{u.email}</td>
                    <td className="py-3 text-muted">{u.contactnumber || '—'}</td>
                    <td className="py-3">
                      <span className="badge px-3 py-2 fw-semibold small rounded-pill"
                        style={{background:role.bg, color:role.color}}>
                        {role.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}