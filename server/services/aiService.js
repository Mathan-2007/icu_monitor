const { GoogleGenerativeAI } = require('@google/generative-ai');
const Vital = require('../models/Vital');
const Patient = require('../models/Patient');
const ApiError = require('../utils/ApiError');

const buildPrompt = (patient, vitals) => `
You are a clinical decision-support assistant in an ICU. Do NOT diagnose or prescribe. Analyze trends and produce risk indicators.

Patient: ${patient.name}, ${patient.age || '?'}y, ${patient.gender || '?'}
Diagnosis: ${patient.diagnosis || 'N/A'}
History: ${patient.medicalHistory || 'N/A'}

Recent vitals (oldest to newest):
${vitals.map(v => `${v.timestamp.toISOString()} | HR:${v.heartRate} BP:${v.systolic}/${v.diastolic} SpO2:${v.spo2} Temp:${v.temperature} RR:${v.respiratoryRate}`).join('\n')}

Respond ONLY with valid JSON, no markdown:
{
  "riskScore": <0-10>,
  "riskLevel": "low"|"medium"|"high",
  "clinicalSummary": "<2-3 sentence plain-language trend summary>",
  "reasoning": ["reason 1", "reason 2"],
  "alerts": [{"priority":"critical"|"high"|"medium", "message":"..."}]
}`;

const buildFallbackAnalysis = (patient, vitals) => {
  const latest = vitals[vitals.length - 1] || {};
  const heartRate = Number(latest.heartRate ?? 0);
  const spo2 = Number(latest.spo2 ?? 100);
  const systolic = Number(latest.systolic ?? 0);
  const respiratoryRate = Number(latest.respiratoryRate ?? 0);

  let riskScore = 0;
  let riskLevel = 'low';
  const reasons = [];

  if (heartRate > 110 || respiratoryRate > 24 || spo2 < 92 || systolic > 160) {
    riskScore += 3;
    reasons.push('Vital signs are trending outside the expected ICU range.');
  }
  if (patient.status === 'critical') {
    riskScore += 3;
    reasons.push('Patient is already in a critical status category.');
  }
  if (patient.diagnosis) {
    riskScore += 1;
    reasons.push(`Diagnosis indicates ongoing clinical concern: ${patient.diagnosis}.`);
  }
  if (reasons.length === 0) {
    reasons.push('Current observations remain relatively stable for now.');
  }

  riskScore = Math.min(10, Math.max(0, riskScore));
  if (riskScore >= 7) riskLevel = 'high';
  else if (riskScore >= 4) riskLevel = 'medium';

  return {
    riskScore,
    riskLevel,
    clinicalSummary: `${patient.name || 'Patient'} currently shows ${riskLevel} risk based on the latest vital trend. Continue monitoring and review the assigned clinical plan as the condition evolves.`,
    reasoning: reasons.slice(0, 4),
    alerts: []
  };
};

exports.analyzePatient = async (patientId) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const vitals = await Vital.find({ patient: patientId }).sort({ timestamp: -1 }).limit(20);
  if (!vitals.length) throw new ApiError(400, 'No vitals recorded for this patient');

  if (!process.env.GEMINI_API_KEY) {
    const fallback = buildFallbackAnalysis(patient, [...vitals].reverse());
    patient.riskScore = fallback.riskScore;
    patient.riskLevel = fallback.riskLevel;
    patient.aiSummary = fallback.clinicalSummary;
    patient.aiReasoning = fallback.reasoning;
    patient.aiUpdatedAt = new Date();
    await patient.save();
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });
    const result = await model.generateContent(buildPrompt(patient, [...vitals].reverse()));
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    patient.riskScore = parsed.riskScore ?? 0;
    patient.riskLevel = parsed.riskLevel || 'low';
    patient.aiSummary = parsed.clinicalSummary;
    patient.aiReasoning = parsed.reasoning || [];
    patient.aiUpdatedAt = new Date();
    await patient.save();

    return parsed;
  } catch (e) {
    console.error('Gemini error:', e.message);
    const fallback = buildFallbackAnalysis(patient, [...vitals].reverse());
    patient.riskScore = fallback.riskScore;
    patient.riskLevel = fallback.riskLevel;
    patient.aiSummary = fallback.clinicalSummary;
    patient.aiReasoning = fallback.reasoning;
    patient.aiUpdatedAt = new Date();
    await patient.save();
    return fallback;
  }
};