import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import QRPage from './pages/QRPage';
import ScannerPage from './pages/ScannerPage';
import AttendancePage from './pages/AttendancePage';
import MealTrackingPage from './pages/MealTrackingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FeedbackPage from './pages/FeedbackPage';
import ExportPage from './pages/ExportPage';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(26, 26, 78, 0.95)',
            color: '#fff',
            border: '1px solid rgba(108, 60, 225, 0.3)',
            backdropFilter: 'blur(10px)',
          },
          success: { iconTheme: { primary: '#00e676', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff2d7b', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* User Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'organizer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/qr/:eventId" element={<QRPage />} />
            <Route path="/feedback/:eventId" element={<FeedbackPage />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/events/create" element={<CreateEvent />} />
            <Route path="/admin/events/edit/:id" element={<CreateEvent />} />
            <Route path="/admin/scanner/:eventId" element={<ScannerPage />} />
            <Route path="/admin/attendance/:eventId" element={<AttendancePage />} />
            <Route path="/admin/meals/:eventId" element={<MealTrackingPage />} />
            <Route path="/admin/analytics/:eventId" element={<AnalyticsPage />} />
            <Route path="/admin/export" element={<ExportPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
