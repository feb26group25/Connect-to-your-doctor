
CREATE DATABASE p25_CTYD;
USE p25_CTYD;

-- ROLES Table
CREATE TABLE ROLES (
    roleid INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE
);

-- USERS Table
CREATE TABLE USERS (
    userid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    mobile_number VARCHAR(15) UNIQUE,
    password VARCHAR(255),
    gender ENUM('Male','Female','Other'),
    date_of_birth DATE,
    bloodgroup VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(100),
    roleid INT,
    created_at DATETIME,
    FOREIGN KEY (roleid) REFERENCES ROLES(roleid)
);

-- HOSPITALS Table
CREATE TABLE HOSPITALS (
    hospitalid INT PRIMARY KEY AUTO_INCREMENT,
    hospital_name VARCHAR(150),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    contact_number VARCHAR(15),
    created_at DATETIME
);

-- DOCTORS Table
CREATE TABLE DOCTORS (
    doctorid INT PRIMARY KEY AUTO_INCREMENT,
    userid INT UNIQUE,
    specialization ENUM('General Physician','Cardiologist','Dermatologist','Pediatrician','Neurologist','Orthopedic','Gynecologist','Psychiatrist','ENT','Ophthalmologist','Dental','Other'),
    degree VARCHAR(100),
    experience_years INT,
    consultation_fee DECIMAL(10,2),
    hospitalid INT,
    created_at DATETIME,
    FOREIGN KEY (userid) REFERENCES USERS(userid),
    FOREIGN KEY (hospitalid) REFERENCES HOSPITALS(hospitalid)
);

-- APPOINTMENTS Table
CREATE TABLE APPOINTMENTS (
    appointmentid INT PRIMARY KEY AUTO_INCREMENT,
    userid INT,
    doctorid INT,
    appointment_date DATE,
    appointment_time TIME,
    reason VARCHAR(255),
    status ENUM('Pending','Accepted','Rejected','Completed','Cancelled'),
    followupdate DATE NULL,
    created_at DATETIME,
    FOREIGN KEY (userid) REFERENCES USERS(userid),
    FOREIGN KEY (doctorid) REFERENCES DOCTORS(doctorid)
);

-- PRESCRIPTIONS Table
CREATE TABLE PRESCRIPTIONS (
    prescriptionid INT PRIMARY KEY AUTO_INCREMENT,
    appointmentid INT,
    what_was_diagnosed VARCHAR(255),
    followupdate DATE NULL,
    created_at DATETIME,
    FOREIGN KEY (appointmentid) REFERENCES APPOINTMENTS(appointmentid)
);

-- MEDICINES Table
CREATE TABLE MEDICINES (
    medicineid INT PRIMARY KEY AUTO_INCREMENT,
    prescriptionid INT,
    nameofmedicine VARCHAR(150),
    dosage VARCHAR(100),
    timing VARCHAR(100),
    comment VARCHAR(500),
    created_at DATETIME,
    FOREIGN KEY (prescriptionid) REFERENCES PRESCRIPTIONS(prescriptionid)
);

-- AVAILABILITY Table
CREATE TABLE AVAILABILITY (
    availabilityid INT PRIMARY KEY AUTO_INCREMENT,
    doctorid INT,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    start_time TIME,
    end_time TIME,
    slot_duration_minutes INT,
    is_available TINYINT(1) DEFAULT 1,
    created_at DATETIME,
    FOREIGN KEY (doctorid) REFERENCES DOCTORS(doctorid)
);

-- FEEDBACK Table
CREATE TABLE FEEDBACK (
    feedbackid INT PRIMARY KEY AUTO_INCREMENT,
    appointmentid INT,
    doctorid INT,
    rating TINYINT UNSIGNED,
    comments VARCHAR(500),
    created_at DATETIME,
    FOREIGN KEY (appointmentid) REFERENCES APPOINTMENTS(appointmentid),
    FOREIGN KEY (doctorid) REFERENCES DOCTORS(doctorid)
);
