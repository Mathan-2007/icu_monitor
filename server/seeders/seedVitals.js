require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Vital = require('../models/Vital');
const { checkVitals } = require('../services/alertEngine');

const rand = (min, max) => min + Math.random() * (max - min);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const patients = await Patient.find({ status: { $ne: 'discharged' } });
  for (const p of patients) {
    const base = p.status === 'critical' ? { hr: [110, 140], spo2: [83, 90], sys: [150, 180], dia: [90, 105], temp: [38.2, 39.4], rr: [24, 30] }
      : p.status === 'serious' ? { hr: [95, 112], spo2: [92, 95], sys: [130, 148], dia: [82, 92], temp: [37.6, 38.4], rr: [19, 23] }
      : { hr: [70, 92], spo2: [95, 99], sys: [110, 128], dia: [72, 84], temp: [36.5, 37.3], rr: [14, 18] };
    const v = await Vital.create({
      patient: p._id, source: 'device',
      heartRate: Math.round(rand(...base.hr)),
      systolic: Math.round(rand(...base.sys)),
      diastolic: Math.round(rand(...base.dia)),
      spo2: Math.round(rand(...base.spo2)),
      temperature: +rand(...base.temp).toFixed(1),
      respiratoryRate: Math.round(rand(...base.rr))
    });
    await checkVitals(p, v);
  }
  console.log('✅ Fresh vitals + threshold alerts added');
  await mongoose.disconnect();
  process.exit(0);
})();