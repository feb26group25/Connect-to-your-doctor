// Base URLs for the three ConnectDoc backend microservices.
// Change these if you deploy the services somewhere other than localhost.
export const USER_API = 'http://localhost:8081';
export const DOCTOR_API = 'http://localhost:8082';
export const APPOINTMENT_API = 'http://localhost:8083';

// Attaches the logged-in user's JWT (issued by user-service on login/register)
// as an Authorization header, for calls that act on the user's behalf.
export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Single source of truth for specialization values, used by SearchDoctor,
// RegisterDoctor, and DoctorProfile so a doctor saved with one label always
// matches how patients filter for them.
export const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
  'Neurologist', 'Orthopedic', 'Gynecologist', 'Psychiatrist',
  'ENT', 'Ophthalmologist', 'Dental', 'Other'
];
