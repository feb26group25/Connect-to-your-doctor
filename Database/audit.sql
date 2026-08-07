USE p25_ctyd;

SELECT '1. ROLES' as 'Table_Name', COUNT(*) as 'Total_Records' FROM roles;
SELECT * FROM roles;

SELECT '2. USERS' as 'Table_Name', COUNT(*) as 'Total_Records' FROM users;
SELECT userid, name, email, mobile_number, roleid FROM users LIMIT 6;

SELECT '3. HOSPITALS' as 'Table_Name', COUNT(*) as 'Total_Records' FROM hospitals;
SELECT hospitalid, hospital_name, city, contact_number FROM hospitals LIMIT 6;

SELECT '4. DOCTORS' as 'Table_Name', COUNT(*) as 'Total_Records' FROM doctors;
SELECT doctorid, doctor_name, specialization, degree, experience_years, email FROM doctors;

SELECT '5. AVAILABILITY' as 'Table_Name', COUNT(*) as 'Total_Records' FROM availability;
SELECT availabilityid, doctorid, start_time, end_time, slot_duration_minutes FROM availability LIMIT 5;

SELECT '6. APPOINTMENTS' as 'Table_Name', COUNT(*) as 'Total_Records' FROM appointments;
SELECT appointmentid, userid as patient_id, doctorid, appointment_date, appointment_time, status FROM appointments LIMIT 8;

SELECT '7. PRESCRIPTIONS' as 'Table_Name', COUNT(*) as 'Total_Records' FROM prescriptions;
SELECT prescriptionid, appointmentid, what_was_diagnosed, followupdate FROM prescriptions;

SELECT '8. MEDICINES' as 'Table_Name', COUNT(*) as 'Total_Records' FROM medicines;
SELECT medicineid, prescriptionid, nameofmedicine, dosage, timing FROM medicines;

SELECT '9. FEEDBACK' as 'Table_Name', COUNT(*) as 'Total_Records' FROM feedback;
SELECT feedbackid, appointmentid, doctorid, rating, comments FROM feedback LIMIT 5;
