
USE p25_CTYD;

-- Insert Roles
INSERT INTO ROLES (role_name) VALUES
('Admin'),
('Doctor'),
('Patient');

-- Insert Users
INSERT INTO USERS (name, email, mobile_number, password, gender, date_of_birth, bloodgroup, city, state, roleid, created_at)
VALUES
('Alice Admin', 'alice.admin@example.com', '9876543210', 'adminPass123', 'Female', '1985-05-10', 'O+', 'Pune', 'MH', 1, NOW()),
('Dr. Bob', 'bob.doctor@example.com', '9876543211', 'doctorPass123', 'Male', '1978-03-22', 'A+', 'Mumbai', 'MH', 2, NOW()),
('Charlie Patient', 'charlie.patient@example.com', '9876543212', 'patientPass123', 'Male', '1995-09-15', 'B-', 'Delhi', 'DL', 3, NOW());

-- Insert Hospitals
INSERT INTO HOSPITALS (hospital_name, address, city, state, pincode, contact_number, created_at)
VALUES
('CityCare Hospital', '123 Main Road', 'Mumbai', 'MH', '400001', '0221234567', NOW());

-- Insert Doctor
INSERT INTO DOCTORS (userid, specialization, degree, experience_years, consultation_fee, hospitalid, created_at)
VALUES
(2, 'Cardiologist', 'MBBS, MD', 15, 800.00, 1, NOW());

-- Insert Appointment
INSERT INTO APPOINTMENTS (userid, doctorid, appointment_date, appointment_time, reason, status, created_at)
VALUES
(3, 1, '2026-08-01', '10:30:00', 'Chest pain', 'Pending', NOW());

-- Insert Prescription
INSERT INTO PRESCRIPTIONS (appointmentid, what_was_diagnosed, followupdate, created_at)
VALUES
(1, 'Mild hypertension', '2026-08-15', NOW());

-- Insert Medicine
INSERT INTO MEDICINES (prescriptionid, nameofmedicine, dosage, timing, comment, created_at)
VALUES
(1, 'Amlodipine', '5mg', 'Once daily', 'Take after breakfast', NOW());

-- Insert Availability
INSERT INTO AVAILABILITY (doctorid, day_of_week, start_time, end_time, slot_duration_minutes, is_available, created_at)
VALUES
(1, 'Monday', '09:00:00', '13:00:00', 30, 1, NOW());

-- Insert Feedback
INSERT INTO FEEDBACK (appointmentid, doctorid, rating, comments, created_at)
VALUES
(1, 1, 5, 'Doctor was very attentive and helpful', NOW());
