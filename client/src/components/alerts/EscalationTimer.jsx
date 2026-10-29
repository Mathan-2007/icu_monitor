import toast from 'react-hot-toast';
import { useAlertStore } from '../../store/alertStore';
import { canAckAlert } from '../../utils/permissions';

const readStoredRole = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser);
    return parsed && typeof parsed === 'object' ? parsed.role : null;
  } catch {
    return null;
  }
};

export default function AcknowledgeButton({ alert }) {
  const ack = useAlertStore((s) => s.ackAlert);
  const role = readStoredRole();
  if (alert.status !== 'active' || !canAckAlert(role)) return null;
  return (
    <button onClick={() => ack(alert._id).then(() => toast.success('Acknowledged')).catch(() => toast.error('Failed'))}
      className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg">Acknowledge</button>
  );
}