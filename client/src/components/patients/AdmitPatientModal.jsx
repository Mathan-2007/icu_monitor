// components/patients/AdmitPatientModal.jsx
import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import PatientForm from './PatientForm';
import { getBeds } from '../../services/bedApi';
import { getUsers } from '../../services/userApi';
import Loader from '../common/Loader';

export default function AdmitPatientModal({ open, onClose, onAdmit }) {
  const [beds, setBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bedsData, users] = await Promise.all([
        getBeds(),
        getUsers()
      ]);
      setBeds(Array.isArray(bedsData) ? bedsData : bedsData.items || []);
      setDoctors(users.filter((x) => x.role === 'doctor'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const handleAdmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await onAdmit(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to admit patient');
      throw err; // Re-throw so parent can handle
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !loading && onClose()} title="Admit Patient">
      {loading && !beds.length && !doctors.length ? (
        <Loader label="Loading data..." />
      ) : (
        <PatientForm 
          beds={beds} 
          doctors={doctors} 
          onCancel={onClose} 
          onSubmit={handleAdmit}
          loading={loading}
          error={error}
        />
      )}
    </Modal>
  );
}