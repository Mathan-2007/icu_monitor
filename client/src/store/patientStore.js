import { create } from 'zustand';
import { getPatients, getPatient, dischargePatient } from '../services/patientApi';
import { getVitals } from '../services/vitalApi';

export const usePatientStore = create((set, get) => ({
  patients: [],
  current: null,
  vitals: [],
  loading: false,
  error: null,

  fetchPatients: async (params) => {
    set({ loading: true, error: null });
    try {
      const patients = await getPatients(params);
      set({ patients: Array.isArray(patients) ? patients : [], loading: false });
      return patients;
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Unable to load patients' });
      return null;
    }
  },

  fetchPatient: async (id) => {
    set((state) => ({ loading: true, error: null, current: state.current?._id === id ? state.current : null, vitals: state.current?._id === id ? state.vitals : [] }));
    try {
      const [current, vitals] = await Promise.all([getPatient(id), getVitals(id, 100)]);
      set({ current, vitals, loading: false });
      return current;
    } catch (error) {
      set({ current: null, loading: false, error: error.response?.data?.message || 'Unable to load patient details' });
      return null;
    }
  },

  discharge: async (id) => {
    await dischargePatient(id);
    set({ patients: get().patients.map((p) => (p._id === id ? { ...p, status: 'discharged' } : p)) });
  },

  // live vitals from socket
  pushVital: (patientId, vital) => {
    if (get().current?._id === patientId) {
      set({ vitals: [...get().vitals, vital].slice(-100) });
    }
    set({
      patients: get().patients.map((p) => (p._id === patientId ? { ...p, latestVital: vital } : p))
    });
  },

  clear: () => set({ current: null, vitals: [], error: null })
}));
