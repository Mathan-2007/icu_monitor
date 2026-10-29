import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/shared/LoginPage';
import UnauthorizedPage from './pages/shared/UnauthorizedPage';
import NotFoundPage from './pages/shared/NotFoundPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import BedsPage from './pages/admin/BedsPage';
import AlertStatsPage from './pages/admin/AlertStatsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import ThresholdsPage from './pages/admin/ThresholdsPage';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientsPage from './pages/doctor/PatientsPage';
import PatientDetailPage from './pages/doctor/PatientDetailPage';
import AlertsPage from './pages/doctor/AlertsPage';

import NurseDashboard from './pages/nurse/NurseDashboard';
import MyBedsPage from './pages/nurse/MyBedsPage';
import VitalsEntryPage from './pages/nurse/VitalsEntryPage';
import NurseAlertsPage from './pages/nurse/AlertsPage';
import HandoverPage from './pages/nurse/HandoverPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowed={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowed={['admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/beds" element={<ProtectedRoute allowed={['admin']}><BedsPage /></ProtectedRoute>} />
          <Route path="/admin/alerts" element={<ProtectedRoute allowed={['admin']}><AlertStatsPage /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowed={['admin']}><AuditLogsPage /></ProtectedRoute>} />
          <Route path="/admin/thresholds" element={<ProtectedRoute allowed={['admin']}><ThresholdsPage /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor" element={<ProtectedRoute allowed={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowed={['doctor']}><PatientsPage /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute allowed={['doctor', 'admin', 'nurse']}><PatientDetailPage /></ProtectedRoute>} />
          <Route path="/doctor/alerts" element={<ProtectedRoute allowed={['doctor']}><AlertsPage /></ProtectedRoute>} />

          {/* Nurse */}
          <Route path="/nurse" element={<ProtectedRoute allowed={['nurse']}><NurseDashboard /></ProtectedRoute>} />
          <Route path="/nurse/my-beds" element={<ProtectedRoute allowed={['nurse']}><MyBedsPage /></ProtectedRoute>} />
          <Route path="/nurse/vitals" element={<ProtectedRoute allowed={['nurse', 'doctor']}><VitalsEntryPage /></ProtectedRoute>} />
          <Route path="/nurse/alerts" element={<ProtectedRoute allowed={['nurse']}><NurseAlertsPage /></ProtectedRoute>} />
          <Route path="/nurse/handover" element={<ProtectedRoute allowed={['nurse']}><HandoverPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}