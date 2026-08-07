USE p25_ctyd;

UPDATE doctors SET doctor_name = 'Priya Patel', specialization = 'Dermatology', degree = 'MBBS, MD (Dermatology)', experience_years = 9, email = 'dr.priya@connectdoc.com', mobile_number = '9876543211' WHERE doctorid = 1;
UPDATE doctors SET doctor_name = 'Hansraj Hathi', specialization = 'ENT', degree = 'MBBS, MS (ENT)', experience_years = 14, email = 'hansraj@connectdoc.com', mobile_number = '9876543216' WHERE doctorid = 2;
UPDATE doctors SET doctor_name = 'Amit Desai', specialization = 'Orthopedics', degree = 'MBBS, MS (Ortho)', experience_years = 11, email = 'dr.amit@connectdoc.com', mobile_number = '9823012345' WHERE doctorid = 3;
UPDATE doctors SET doctor_name = 'Sneha Kulkarni', specialization = 'Pediatrics', degree = 'MBBS, MD (Pediatrics)', experience_years = 8, email = 'dr.sneha@connectdoc.com', mobile_number = '9876509876' WHERE doctorid = 4;
UPDATE doctors SET doctor_name = 'Rajesh Iyer', specialization = 'Neurology', degree = 'MBBS, DM (Neurology)', experience_years = 16, email = 'dr.rajesh@connectdoc.com', mobile_number = '9861296082' WHERE doctorid = 5;
UPDATE doctors SET doctor_name = 'Ramesh Sharma', specialization = 'Cardiology', degree = 'MBBS, MD (Cardiology)', experience_years = 12, email = 'drsharma@connectdoc.com', mobile_number = '9820011223' WHERE doctorid = 6;

SELECT doctorid, doctor_name, specialization, email FROM doctors;
