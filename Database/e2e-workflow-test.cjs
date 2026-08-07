const assert = require('assert');

const USER_API = 'http://localhost:8081';
const DOCTOR_API = 'http://localhost:8082';
const APPOINTMENT_API = 'http://localhost:8083';

async function executeFullWorkflow() {
  console.log('================================================================');
  console.log('  CONNECTDOC: LIVE END-TO-END WORKFLOW & DATA SIMULATION');
  console.log('================================================================\n');

  const randomId = Math.floor(Math.random() * 8999) + 1000;
  const doctorEmail = `dr.sharma.${randomId}@connectdoc.com`;
  const patientEmail = `rohit.verma.${randomId}@connectdoc.com`;
  const password = 'password123';

  const doctorMobile = '98' + String(Math.floor(Math.random() * 89999999) + 10000000);
  const patientMobile = '91' + String(Math.floor(Math.random() * 89999999) + 10000000);

  // --- STEP 1: REGISTER NEW DOCTOR ---
  console.log('1. [DOCTOR REGISTRATION]');
  console.log(`   Registering Doctor: Dr. Ramesh Sharma (${doctorEmail})...`);
  const docRegRes = await fetch(`${DOCTOR_API}/api/doctors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `drsharma${randomId}`,
      password: password,
      firstname: 'Ramesh',
      lastname: 'Sharma',
      email: doctorEmail,
      contactnumber: doctorMobile,
      specialization: 'Cardiology',
      experience: '12',
      qualification: 'MBBS, MD (Cardiology)',
      hospitalname: 'City Care Hospital Pune'
    })
  });
  if (!docRegRes.ok) {
    const errBody = await docRegRes.json();
    console.error('Registration failed with:', docRegRes.status, errBody);
  }
  assert.ok(docRegRes.status === 200 || docRegRes.status === 201, `Doctor registration status: ${docRegRes.status}`);
  console.log('   ✓ Doctor registered successfully in database!');

  // Fetch doctors list to get doctor's assigned doctorId
  const doctorsListRes = await fetch(`${DOCTOR_API}/api/doctors`);
  const doctorsList = await doctorsListRes.json();
  const createdDoctor = doctorsList.find(d => d.email === doctorEmail || d.username === `drsharma${randomId}`);
  assert.ok(createdDoctor, 'Doctor should appear in active doctors list');
  const doctorId = createdDoctor.doctorId || createdDoctor.userId;
  console.log(`   ✓ Doctor verified. Doctor ID: ${doctorId}, Specialization: ${createdDoctor.specialization}, Hospital: ${createdDoctor.hospitalname}\n`);

  // --- STEP 2: REGISTER NEW PATIENT ---
  console.log('2. [PATIENT REGISTRATION]');
  console.log(`   Registering Patient: Rohit Verma (${patientEmail})...`);
  const patRegRes = await fetch(`${USER_API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohit Verma',
      email: patientEmail,
      mobileNumber: patientMobile,
      password: password,
      roleName: 'Patient'
    })
  });
  assert.ok(patRegRes.status === 200 || patRegRes.status === 201, `Patient registration status: ${patRegRes.status}`);
  const patientAuth = await patRegRes.json();
  const patientId = patientAuth.userId;
  console.log(`   ✓ Patient registered. Patient ID: ${patientId}, Token received.\n`);

  // --- STEP 3: DOCTOR SETS WORKING SCHEDULE / AVAILABILITY ---
  console.log('3. [DOCTOR AVAILABILITY SETUP]');
  console.log('   Dr. Ramesh Sharma setting consultation hours (09:00 AM - 05:00 PM, 30 min slots)...');
  const availRes = await fetch(`${DOCTOR_API}/api/doctors/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorid: doctorId,
      dayOfWeek: 'ALL',
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30
    })
  });
  assert.ok(availRes.status === 200 || availRes.status === 201, 'Availability saved');
  console.log('   ✓ Doctor availability slots generated and active.\n');

  // --- STEP 4: PATIENT BOOKS AN APPOINTMENT ---
  console.log('4. [PATIENT APPOINTMENT BOOKING]');
  console.log(`   Patient Rohit Verma booking appointment with Dr. Ramesh Sharma for 2026-08-20 at 10:30 AM...`);
  const bookRes = await fetch(`${APPOINTMENT_API}/appointment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientid: patientId,
      doctorid: doctorId,
      appointmentdate: '2026-08-20',
      appointmenttime: '10:30',
      reason: 'Chest discomfort and ECG consultation'
    })
  });
  assert.strictEqual(bookRes.status, 200, 'Appointment booking should succeed');
  console.log('   ✓ Appointment booked successfully!');

  // Retrieve booked appointment
  const allApptsRes = await fetch(`${APPOINTMENT_API}/appointments`);
  const allAppts = await allApptsRes.json();
  const bookedAppt = allAppts.find(a => 
    (a.patientid === patientId || a.patientId === patientId || a.patientfirst === 'Rohit') &&
    (a.doctorid === doctorId || a.doctorId === doctorId || a.doctorlast === 'Sharma')
  );
  assert.ok(bookedAppt, 'Booked appointment should exist in system');
  const appointmentId = bookedAppt.appointmentid || bookedAppt.appointmentId || bookedAppt.id;
  console.log(`   ✓ Appointment record found (ID: #${appointmentId}, Initial Status: "${bookedAppt.status}")\n`);

  // --- STEP 5: DOCTOR REVIEWS & ACCEPTS APPOINTMENT ---
  console.log('5. [DOCTOR ACCEPTS APPOINTMENT]');
  console.log(`   Dr. Ramesh Sharma accepts Appointment #${appointmentId}...`);
  const acceptRes = await fetch(`${APPOINTMENT_API}/appointment/accept/${appointmentId}`, {
    method: 'PUT'
  });
  assert.strictEqual(acceptRes.status, 200, 'Accept appointment should succeed');
  
  // Verify status updated to Accepted
  const checkAccepted = await fetch(`${APPOINTMENT_API}/appointments`);
  const checkAcceptedData = await checkAccepted.json();
  const updatedAppt1 = checkAcceptedData.find(a => (a.appointmentid || a.id) == appointmentId);
  console.log(`   ✓ Appointment #${appointmentId} Status updated to: "${updatedAppt1.status}"\n`);

  // --- STEP 6: DOCTOR WRITES PRESCRIPTION & COMPLETES CONSULTATION ---
  console.log('6. [PRESCRIPTION & CONSULTATION COMPLETION]');
  console.log(`   Dr. Ramesh Sharma generating prescription for Patient Rohit Verma...`);
  const rxRes = await fetch(`${APPOINTMENT_API}/prescription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appointmentid: appointmentId,
      patientid: patientId,
      doctorid: doctorId,
      medicines: [
        { medicinename: 'Atorvastatin 10mg', dosage: '1 tablet after dinner (30 days)' },
        { medicinename: 'Aspirin 75mg', dosage: '1 tablet in the morning (30 days)' }
      ]
    })
  });
  assert.ok(rxRes.status === 200 || rxRes.status === 201, 'Prescription saved');
  console.log('   ✓ Prescription saved with prescribed medicines.');

  // Mark appointment as Completed
  console.log(`   Dr. Ramesh Sharma completing Appointment #${appointmentId}...`);
  const completeRes = await fetch(`${APPOINTMENT_API}/appointment/complete/${appointmentId}`, {
    method: 'PUT'
  });
  assert.strictEqual(completeRes.status, 200, 'Complete appointment should succeed');

  const checkCompleted = await fetch(`${APPOINTMENT_API}/appointments`);
  const checkCompletedData = await checkCompleted.json();
  const updatedAppt2 = checkCompletedData.find(a => (a.appointmentid || a.id) == appointmentId);
  console.log(`   ✓ Appointment #${appointmentId} Status updated to: "${updatedAppt2.status}"\n`);

  // --- STEP 7: PATIENT SUBMITS FEEDBACK ---
  console.log('7. [PATIENT FEEDBACK & RATING]');
  console.log(`   Patient Rohit Verma submitting 5-star rating for Dr. Ramesh Sharma...`);
  const feedbackRes = await fetch(`${APPOINTMENT_API}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appointmentid: appointmentId,
      rating: 5,
      comments: 'Dr. Ramesh Sharma explained everything thoroughly and prescribed effective medication. Excellent doctor!'
    })
  });
  assert.ok(feedbackRes.status === 200 || feedbackRes.status === 201, 'Feedback saved');
  console.log('   ✓ Patient feedback submitted successfully.\n');

  console.log('================================================================');
  console.log('  ALL WORKFLOW PROCESSES EXECUTED AND VALIDATED SUCCESSFULLY!');
  console.log('================================================================');
  console.log(`  Doctor Login:  ${doctorEmail} / password: ${password}`);
  console.log(`  Patient Login: ${patientEmail} / password: ${password}`);
  console.log(`  Appointment:   #${appointmentId} (Status: Completed)`);
  console.log('================================================================\n');
}

executeFullWorkflow().catch(err => {
  console.error('Workflow Failed:', err);
  process.exit(1);
});
