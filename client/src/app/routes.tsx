import { createBrowserRouter } from 'react-router';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetail from './pages/AssignmentDetail';
import ProjectSubmission from './pages/ProjectSubmission';
import ProjectView from './pages/ProjectView';
import RoboticsTools from './pages/RoboticsTools';
import Analytics from './pages/Analytics';
import Students from './pages/Students';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export const router = createBrowserRouter([
  { path: '/', Component: Landing },
  { path: '/login', Component: Login },
  { path: '/register', Component: Register },
  {
    path: '/teacher/dashboard',
    element: (
      <ProtectedRoute role="teacher">
        <TeacherDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/assignments/create',
    element: (
      <ProtectedRoute role="teacher">
        <CreateAssignment />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/students',
    element: (
      <ProtectedRoute role="teacher">
        <Students />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/analytics',
    element: (
      <ProtectedRoute role="teacher">
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/dashboard',
    element: (
      <ProtectedRoute role="student">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/assignment/:id',
    element: (
      <ProtectedRoute>
        <AssignmentDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/assignment/:id/submit',
    element: (
      <ProtectedRoute role="student">
        <ProjectSubmission />
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:id',
    element: (
      <ProtectedRoute>
        <ProjectView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools',
    element: (
      <ProtectedRoute>
        <RoboticsTools />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
]);
