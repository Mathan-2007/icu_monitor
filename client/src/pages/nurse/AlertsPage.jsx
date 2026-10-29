// src/pages/doctor/AlertsPage.jsx  AND  src/pages/nurse/AlertsPage.jsx — same content:
import AlertFeed from '../../components/alerts/AlertFeed';
export default function AlertsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🚨 Alert Management</h1>
      <AlertFeed params={{}} limit={100} />
    </div>
  );
}