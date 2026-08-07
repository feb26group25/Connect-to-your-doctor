package com.connectdoc.appointment.repository;

import com.connectdoc.appointment.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Integer> {
    List<Medicine> findByPrescriptionPrescriptionId(Integer prescriptionId);
}
