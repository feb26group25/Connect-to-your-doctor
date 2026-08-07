package com.connectdoc.appointment.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEDICINES")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medicineid")
    private Integer medicineId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescriptionid")
    @JsonIgnore
    private Prescription prescription;

    @Column(name = "nameofmedicine", length = 150)
    private String nameOfMedicine;

    @Column(name = "dosage", length = 100)
    private String dosage;

    @Column(name = "timing", length = 100)
    private String timing;

    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Medicine() {}

    public Integer getMedicineId() { return medicineId; }
    public void setMedicineId(Integer medicineId) { this.medicineId = medicineId; }

    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }

    public String getNameOfMedicine() { return nameOfMedicine; }
    public void setNameOfMedicine(String nameOfMedicine) { this.nameOfMedicine = nameOfMedicine; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
