import { useEffect, useState } from 'react'
import { USER_API } from '../api'

export default function AllUsers() {
  const [users, setUsers] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${USER_API}/api/users`)
      .then(resp => resp.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setMsg('No users found.')
        }
        if (Array.isArray(data)) {
          setUsers(data)
        }
      })
      .catch(() => setMsg('Could not fetch users.'))
  }, [])

  const getRoleBadge = (u) => {
    const roleName = (u.roleName || u.role || '').toString().trim()
    const upperRole = roleName.toUpperCase()

    if (upperRole.includes('ADMIN')) {
      return { label: 'Admin', bg: '#fdeaea', color: '#a81a1a' }
    }
    if (upperRole.includes('DOCTOR')) {
      return { label: 'Doctor', bg: '#e8fdf4', color: '#1a8a5a' }
    }
    if (upperRole.includes('PATIENT')) {
      return { label: 'Patient', bg: '#e8f4fd', color: '#1a6fa8' }
    }

    const nameStr = (u.name || u.firstname || '').toString().trim()
    if (/^dr[\s\.]/i.test(nameStr) || /^doctor[\s\.]/i.test(nameStr)) {
      return { label: 'Doctor', bg: '#e8fdf4', color: '#1a8a5a' }
    }

    if (roleName) {
      const formatted = roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase()
      return { label: formatted, bg: '#f3e8ff', color: '#6b21a8' }
    }
    return { label: 'Unknown', bg: '#f0f0f0', color: '#555' }
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
              {users.map((u, index) => {
                const role = getRoleBadge(u)
                const userId = u.userId ?? u.userid ?? u.id ?? '—'
                const rowKey = u.userId ?? u.userid ?? u.id ?? index
                const displayName = u.name || (u.firstname ? `${u.firstname} ${u.lastname || ''}`.trim() : '—')
                const username = u.username || (u.email ? u.email.split('@')[0] : '—')
                const contact = u.mobileNumber || u.contactnumber || u.mobile || '—'

                return (
                  <tr key={rowKey}>
                    <td className="py-3 px-4 text-muted small">{userId}</td>
                    <td className="py-3 fw-semibold">{displayName}</td>
                    <td className="py-3 text-muted">{username}</td>
                    <td className="py-3 text-muted">{u.email || '—'}</td>
                    <td className="py-3 text-muted">{contact}</td>
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