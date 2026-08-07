package com.connectdoc.appointment.dto;

// Mirrors doctor-service's /api/doctors/{id} response shape (only the
// fields appointment-service needs when building joined responses).
public class RemoteDoctor {
    private Integer doctorId;
    private Integer userId;
    private String doctorName;
    private String specialization;
    private RemoteHospital hospital;

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public RemoteHospital getHospital() { return hospital; }
    public void setHospital(RemoteHospital hospital) { this.hospital = hospital; }

    public static class RemoteHospital {
        private String hospitalName;
        public String getHospitalName() { return hospitalName; }
        public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    }
}
