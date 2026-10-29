const Vital = require('../models/Vital');
const Patient = require('../models/Patient');
const { checkVitals } = require('./alertEngine');
const { emitToRoom } = require('./notificationService');

let timer = null;

const rand = (min, max) => min + Math.random() * (max - min);
const round = (n, d = 0) => +n.toFixed(d);

exports.startSimulator = () => {
  const interval = +process.env.SIMULATOR_INTERVAL_MS || 5000;
  timer = setInterval(async () => {
    try {
      const patients = await Patient.find({ status: { $ne: 'discharged' } });
      for (const p of patients) {
        const base = p.status === 'critical'
          ? { hr: [105, 140], spo2: [82, 91], sys: [140, 180], temp: [38, 39.5] }
          : p.status === 'serious'
          ? { hr: [90, 115], spo2: [90, 95], sys: [125, 150], temp: [37.5, 38.5] }
          : { hr: [65, 95], spo2: [94, 99], sys: [105, 130], temp: [36.4, 37.4] };

        const vital = await Vital.create({
          patient: p._id, source: 'simulator',
          heartRate: round(rand(...base.hr)),
          systolic: round(rand(...base.sys)),
          diastolic: round(rand(60, 90)),
          spo2: round(rand(...base.spo2)),
          temperature: round(rand(...base.temp), 1),
          respiratoryRate: round(rand(12, 24)),
          timestamp: new Date()
        });

        emitToRoom(`patient:${p._id}`, 'vitals:new', vital);
        emitToRoom('role:doctor', 'vitals:new', { patientId: p._id, vital });
        emitToRoom('role:nurse', 'vitals:new', { patientId: p._id, vital });

        const alerts = await checkVitals(p, vital);
        alerts.forEach(a => {
          emitToRoom('role:doctor', 'alert:new', a);
          emitToRoom('role:nurse', 'alert:new', a);
        });
      }
    } catch (e) { console.error('simulator error:', e.message); }
  }, interval);
  console.log(`🧪 Vitals simulator running every ${interval / 1000}s`);
};

exports.stopSimulator = () => timer && clearInterval(timer);