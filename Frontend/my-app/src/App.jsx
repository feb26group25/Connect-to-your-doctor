import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import LoginComp from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import ProtectedRoute from './components/ProtectedRoutes'
import SearchDoctor from './pages/SearchDoctor'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import AllAppointments from './pages/AllAppointments'
import AllUsers from './pages/AllUsers'
import DoctorAppointments from './pages/DoctorAppointments'
import AddPrescription from './pages/AddPrescription'
import DoctorAvailability from './pages/DoctorAvailability'
import DoctorFeedback from './pages/DoctorFeedback'
import RegisterDoctor from './pages/RegisterDoctor'
import Profile from './pages/Profile'
import DoctorProfile from './pages/DoctorProfile'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginComp />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute role="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route path="users" element={<AllUsers />} />
          <Route path="appointments" element={<AllAppointments />} />
          <Route path="registerdoctor" element={<RegisterDoctor />} />
        </Route>

        {/* Patient Routes */}
        <Route path="/user-dashboard" element={
          <ProtectedRoute role="Patient">
            <UserDashboard />
          </ProtectedRoute>
        }>
          <Route path="search" element={<SearchDoctor />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="myappointments" element={<MyAppointments />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor-dashboard" element={
          <ProtectedRoute role="Doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }>
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="availability" element={<DoctorAvailability />} />
          <Route path="prescription" element={<AddPrescription />} />
          <Route path="feedback" element={<DoctorFeedback />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>



      </Routes>
    </BrowserRouter>
  )
}

export default App