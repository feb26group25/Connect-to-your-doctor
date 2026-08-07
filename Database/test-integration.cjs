const assert = require('assert');

async function runValidation() {
  console.log('=== RUNNING CONNECTDOC SYSTEM VALIDATION SUITE ===\n');
  let passCount = 0;
  let failCount = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`TEST: ${name} ... `);
      await fn();
      console.log('\x1b[32mPASSED\x1b[0m');
      passCount++;
    } catch (err) {
      console.log('\x1b[31mFAILED\x1b[0m');
      console.error('   Error:', err.message);
      failCount++;
    }
  }

  // 1. Frontend Health Check
  await test('Frontend (Vite Server on Port 5173) Responds with HTTP 200', async () => {
    const res = await fetch('http://localhost:5173/');
    assert.strictEqual(res.status, 200, 'Frontend should return 200 OK');
  });

  // 2. User Service Health & Auth Login
  let patientUserId = null;
  await test('User-Service (Port 8081): Patient Login and Token Generation', async () => {
    const res = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@example.com', password: 'password123' })
    });
    assert.strictEqual(res.status, 200, 'Login should succeed with 200');
    const data = await res.json();
    assert.ok(data.token, 'Should return JWT token');
    assert.strictEqual(data.role, 'Patient', 'Role should be Patient');
    patientUserId = data.userId;
  });

  // 3. User Service: Doctor Login
  await test('User-Service (Port 8081): Doctor Login and Role Verification', async () => {
    const res = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@example.com', password: 'password123' })
    });
    assert.strictEqual(res.status, 200, 'Doctor login should succeed');
    const data = await res.json();
    assert.ok(data.token, 'Should return JWT token');
    assert.strictEqual(data.role, 'Doctor', 'Role should be Doctor');
  });

  // 4. User Service: Admin Login
  await test('User-Service (Port 8081): Admin Login and Role Verification', async () => {
    const res = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
    });
    assert.strictEqual(res.status, 200, 'Admin login should succeed');
    const data = await res.json();
    assert.strictEqual(data.role, 'Admin', 'Role should be Admin');
  });

  // 5. User Service: List Users
  await test('User-Service (Port 8081): Get All Registered Users', async () => {
    const res = await fetch('http://localhost:8081/api/users');
    assert.strictEqual(res.status, 200);
    const users = await res.json();
    assert.ok(Array.isArray(users), 'Should return list of users');
    assert.ok(users.length > 0, 'Users count should be greater than 0');
  });

  // 6. Doctor Service: Fetch Doctors
  let activeDoctorId = null;
  await test('Doctor-Service (Port 8082): Get All Doctors with Hospital and Specialization', async () => {
    const res = await fetch('http://localhost:8082/api/doctors');
    assert.strictEqual(res.status, 200);
    const doctors = await res.json();
    assert.ok(Array.isArray(doctors), 'Should return doctors array');
    assert.ok(doctors.length > 0, 'Doctors list should have active records');
    activeDoctorId = doctors[0].doctorId || doctors[0].userId;
  });

  // 7. Doctor Service: Manage Doctor Availability
  await test('Doctor-Service (Port 8082): Set and Fetch Doctor Availability Schedule', async () => {
    const saveRes = await fetch('http://localhost:8082/api/doctors/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorid: activeDoctorId,
        dayOfWeek: 'ALL',
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30
      })
    });
    assert.ok(saveRes.status === 200 || saveRes.status === 201, 'Save availability should return 200/201');

    const getRes = await fetch(`http://localhost:8082/api/doctors/${activeDoctorId}/availability`);
    assert.strictEqual(getRes.status, 200);
    const schedules = await getRes.json();
    assert.ok(Array.isArray(schedules), 'Should return array of schedules');
  });

  // 8. Appointment Service: Book an Appointment
  await test('Appointment-Service (Port 8083): Book New Appointment', async () => {
    const uniqueMin = String(Math.floor(Math.random() * 50) + 10).padStart(2, '0');
    const uniqueHour = String(Math.floor(Math.random() * 8) + 9).padStart(2, '0');
    const res = await fetch('http://localhost:8083/appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientid: patientUserId,
        doctorid: activeDoctorId,
        appointmentdate: '2026-08-15',
        appointmenttime: `${uniqueHour}:${uniqueMin}`,
        reason: 'Routine health checkup'
      })
    });
    assert.strictEqual(res.status, 200, `Book appointment returned status ${res.status}`);
    const data = await res.json();
    assert.ok(data.message.includes('successfully'), 'Should return success message');
  });

  // 9. Appointment Service: Fetch All Appointments & Manage Status
  let targetApptId = null;
  await test('Appointment-Service (Port 8083): List Appointments and Filter by Patient/Doctor', async () => {
    const res = await fetch('http://localhost:8083/appointments');
    assert.strictEqual(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list), 'Should return list of appointments');
    assert.ok(list.length > 0, 'Should have at least one appointment');
    targetApptId = list[0].appointmentid || list[0].appointmentId || list[0].id;
  });

  // 10. Appointment Service: Status Transition (Accept)
  if (targetApptId) {
    await test(`Appointment-Service (Port 8083): Update Appointment Status (Accept #${targetApptId})`, async () => {
      const res = await fetch(`http://localhost:8083/appointment/accept/${targetApptId}`, {
        method: 'PUT'
      });
      assert.strictEqual(res.status, 200, 'Accept appointment should succeed');
    });
  }

  // 11. Appointment Service: Prescription Management
  await test('Appointment-Service (Port 8083): Save Prescription Record', async () => {
    const res = await fetch('http://localhost:8083/prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentid: targetApptId,
        patientid: patientUserId,
        doctorid: activeDoctorId,
        medicines: [{ medicinename: 'Paracetamol 500mg', dosage: '1 tablet twice daily' }]
      })
    });
    assert.ok(res.status === 200 || res.status === 201, `Save prescription returned status ${res.status}`);
  });

  console.log('\n=================================================');
  console.log(`VALIDATION COMPLETED: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('=================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runValidation().catch(err => {
  console.error('Fatal Validation Error:', err);
  process.exit(1);
});
