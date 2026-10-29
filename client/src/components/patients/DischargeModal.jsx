// components/patients/DischargeModal.jsx
import { useState } from 'react';
import ConfirmDialog from '../common/ConfirmDialog';
import Loader from '../common/Loader';

export default function DischargeModal({ open, onClose, onConfirm, patient }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog 
      open={open} 
      onClose={() => !loading && onClose()}
      onConfirm={handleConfirm}
      title={`Discharge ${patient?.name || 'patient'}?`}
      message="The bed will be released for cleaning. Vitals history and alerts are retained."
      confirmLabel={loading ? <Loader inline small /> : 'Confirm Discharge'}
      busy={loading}
    />
  );
}