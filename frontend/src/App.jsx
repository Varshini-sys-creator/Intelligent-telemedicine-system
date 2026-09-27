import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import PatientDashboard from './pages/patient/PatientDashboard';
import SymptomChecker from './pages/patient/SymptomChecker';
import BookConsultation from './pages/patient/BookConsultation';
import MyConsultations from './pages/patient/MyConsultations';
import MedicalRecords from './pages/patient/MedicalRecords';
import HealthMonitoring from './pages/patient/HealthMonitoring';
import EmergencySOS from './pages/patient/EmergencySOS';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AddMedicalRecord from './pages/doctor/AddMedicalRecord';

import ChwDashboard from './pages/chw/ChwDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import VideoConsultation from './pages/consultation/VideoConsultation';
import NotFoundPage from './pages/NotFoundPage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ROLE_PATIENT') return <Navigate to="/patient" replace />;
  if (user?.role === 'ROLE_DOCTOR') return <Navigate to="/doctor" replace />;
  if (user?.role === 'ROLE_CHW') return <Navigate to="/chw" replace />;
  if (user?.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Main Layout Routes */}
      <Route element={<MainLayout />}>
        {/* Patient Portal */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/symptoms"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <SymptomChecker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <BookConsultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/consultations"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <MyConsultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/records"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <MedicalRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/monitoring"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <HealthMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/emergency"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <EmergencySOS />
            </ProtectedRoute>
          }
        />

        {/* Doctor Portal */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/requests"
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/records/new"
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <AddMedicalRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/analytics"
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Community Health Worker Portal */}
        <Route
          path="/chw"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CHW']}>
              <ChwDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chw/patients"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CHW']}>
              <ChwDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chw/monitoring"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CHW']}>
              <HealthMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chw/emergency"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CHW']}>
              <ChwDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chw/analytics"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CHW']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Administrator Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* WebRTC Video Consultation Room */}
        <Route
          path="/consultation/room/:roomId"
          element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_CHW']}>
              <VideoConsultation />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
