/* Run: npm run seed  (local demo data; no destructive reset) */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const Vital = require('../models/Vital');
const Alert = require('../models/Alert');
const Threshold = require('../models/Threshold');

const rand = (min, max) => min + Math.random() * (max - min);

const demoUsers = [
  { name: 'Admin Mathan', email: 'admin@icu.local', password: 'admin123', role: 'admin' },
  { name: 'Dr. Ravi Kumar', email: 'ravi@icu.local', password: 'doctor123', role: 'doctor', specialization: 'Critical Care' },
  { name: 'Dr. Priya Nair', email: 'priya@icu.local', password: 'doctor123', role: 'doctor', specialization: 'Cardiology' },
  { name: 'Nurse Anitha', email: 'anu@icu.local', password: 'nurse123', role: 'nurse' },
  { name: 'Nurse Kumar', email: 'kumar@icu.local', password: 'nurse123', role: 'nurse' }
];

const upsertUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return User.create(payload);
};

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required before running the seed script.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Preparing idempotent demo seed...');

  const [admin, drRavi, drPriya, nurseAnu, nurseKumar] = await Promise.all(demoUsers.map(upsertUser));

  const bedPromises = Array.from({ length: 10 }, (_, i) => {
    const bedNumber = `ICU-${String(i + 1).padStart(2, '0')}`;
    return Bed.findOneAndUpdate(
      { bedNumber },
      { $setOnInsert: { bedNumber, isOccupied: false, currentPatient: null } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  });
  const beds = await Promise.all(bedPromises);

  const patientSeeds = [
    { patientId: 'P1001', name: 'Ramesh Iyer', age: 67, gender: 'male', diagnosis: 'Sepsis, AKI', medicalHistory: 'Diabetic, CKD stage 3', status: 'critical', doctor: drRavi._id, nurses: [nurseAnu._id] },
    { patientId: 'P1002', name: 'Lakshmi Menon', age: 54, gender: 'female', diagnosis: 'Post-cardiac surgery', medicalHistory: 'Hypertension', status: 'critical', doctor: drRavi._id, nurses: [nurseAnu._id] },
    { patientId: 'P1003', name: 'Suresh Babu', age: 45, gender: 'male', diagnosis: 'Severe pneumonia', medicalHistory: 'Smoker', status: 'serious', doctor: drRavi._id, nurses: [nurseKumar._id] },
    { patientId: 'P1004', name: 'Fathima Beevi', age: 72, gender: 'female', diagnosis: 'COPD exacerbation', medicalHistory: 'COPD, ex-smoker', status: 'serious', doctor: drRavi._id, nurses: [nurseKumar._id] },
    { patientId: 'P1005', name: 'Arun Prasad', age: 30, gender: 'male', diagnosis: 'Dengue fever', medicalHistory: 'None', status: 'stable', doctor: drRavi._id, nurses: [nurseAnu._id] },
    { patientId: 'P1006', name: 'Divya Raman', age: 28, gender: 'female', diagnosis: 'Post-appendectomy', medicalHistory: 'None', status: 'stable', doctor: drRavi._id, nurses: [nurseAnu._id] },
    { patientId: 'P1007', name: 'Mohan Das', age: 61, gender: 'male', diagnosis: 'Stroke, ICU observation', medicalHistory: 'Atrial fibrillation', status: 'serious', doctor: drRavi._id, nurses: [nurseKumar._id] },
    { patientId: 'P1008', name: 'Geetha Krishnan', age: 49, gender: 'female', diagnosis: 'Ketoacidosis', medicalHistory: 'Type 1 diabetes', status: 'stable', doctor: drRavi._id, nurses: [nurseKumar._id] }
  ];

  const patients = [];
  for (let i = 0; i < patientSeeds.length; i += 1) {
    const payload = patientSeeds[i];
    const bed = beds[i];
    const patient = await Patient.findOneAndUpdate(
      { patientId: payload.patientId },
      {
        $set: {
          ...payload,
          icuBed: bed._id,
          assignedDoctor: payload.doctor,
          assignedNurses: payload.nurses,
          riskLevel: payload.status === 'critical' ? 'high' : payload.status === 'serious' ? 'medium' : 'low',
          riskScore: payload.status === 'critical' ? rand(7.5, 9.5) : payload.status === 'serious' ? rand(4, 6.5) : rand(1, 3),
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Bed.findByIdAndUpdate(bed._id, { isOccupied: true, currentPatient: patient._id });
    patients.push(patient);
  }

  const now = Date.now();
  let insertedVitals = 0;
  for (const patient of patients) {
    const existingVitalCount = await Vital.countDocuments({ patient: patient._id });
    if (existingVitalCount >= 48) continue;

    const base = patient.status === 'critical'
      ? { hr: 122, spo2: 88, sys: 160, dia: 95, temp: 38.8, rr: 26 }
      : patient.status === 'serious'
        ? { hr: 98, spo2: 93, sys: 135, dia: 85, temp: 38.0, rr: 21 }
        : { hr: 80, spo2: 97, sys: 118, dia: 76, temp: 36.8, rr: 16 };

    const docs = [];
    for (let i = 0; i < 48; i += 1) {
      const timestamp = new Date(now - (48 - i) * 15 * 60 * 1000);
      const progress = i / 48;
      const drift = patient.status === 'stable' ? 0 : progress;
      docs.push({
        patient: patient._id,
        source: 'device',
        timestamp,
        heartRate: Math.round(base.hr + drift * 14 + rand(-4, 4)),
        systolic: Math.round(base.sys + drift * 10 + rand(-5, 5)),
        diastolic: Math.round(base.dia + drift * 6 + rand(-3, 3)),
        spo2: Math.round(base.spo2 - drift * 4 + rand(-1.5, 1.5)),
        temperature: +(base.temp + drift * 0.6 + rand(-0.2, 0.2)).toFixed(1),
        respiratoryRate: Math.round(base.rr + drift * 4 + rand(-1, 1))
      });
    }

    const inserted = await Vital.insertMany(docs);
    insertedVitals += inserted.length;
  }

  await Threshold.findOneAndUpdate(
    { scope: 'global' },
    { $setOnInsert: { scope: 'global' } },
    { upsert: true, new: true }
  );

  console.log(`\n✅ Seed complete. Demo accounts created or refreshed: ${demoUsers.length} users, ${patients.length} patients, ${insertedVitals} vital readings.`);
  console.log('Login accounts:');
  console.log('Admin  → admin@icu.local  / admin123');
  console.log('Doctor → ravi@icu.local   / doctor123');
  console.log('Doctor → priya@icu.local / doctor123');
  console.log('Nurse  → anu@icu.local    / nurse123');
  console.log('Nurse  → kumar@icu.local  / nurse123');
  console.log('Note: Demo credentials are only for local development.');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});