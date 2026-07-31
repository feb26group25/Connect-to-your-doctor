package com.connectdoc.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PRESCRIPTIONS")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prescriptionid")
    private Integer prescriptionId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointmentid")
    private Appointment appointment;

    @Column(name = "what_was_diagnosed", length = 255)
    private String whatWasDiagnosed;

    @Column(name = "followupdate")
    private LocalDate followUpDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Medicine> medicines = new ArrayList<>();

    public Prescription() {}

    public Integer getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Integer prescriptionId) { this.prescriptionId = prescriptionId; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }

    public String getWhatWasDiagnosed() { return whatWasDiagnosed; }
    public void setWhatWasDiagnosed(String whatWasDiagnosed) { this.whatWasDiagnosed = whatWasDiagnosed; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Medicine> getMedicines() { return medicines; }
    public void setMedicines(List<Medicine> medicines) { this.medicines = medicines; }

    public void addMedicine(Medicine medicine) {
        medicines.add(medicine);
        medicine.setPrescription(this);
    }
}
