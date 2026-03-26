import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateAssignment from "./pages/CreateAssignment";
import AssignmentDetail from "./pages/AssignmentDetail";
import ProjectSubmission from "./pages/ProjectSubmission";
import ProjectView from "./pages/ProjectView";
import RoboticsTools from "./pages/RoboticsTools";
import Analytics from "./pages/Analytics";
import Students from "./pages/Students";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/teacher/dashboard",
    Component: TeacherDashboard,
  },
  {
    path: "/teacher/assignments/create",
    Component: CreateAssignment,
  },
  {
    path: "/teacher/students",
    Component: Students,
  },
  {
    path: "/teacher/analytics",
    Component: Analytics,
  },
  {
    path: "/student/dashboard",
    Component: StudentDashboard,
  },
  {
    path: "/assignment/:id",
    Component: AssignmentDetail,
  },
  {
    path: "/assignment/:id/submit",
    Component: ProjectSubmission,
  },
  {
    path: "/project/:id",
    Component: ProjectView,
  },
  {
    path: "/tools",
    Component: RoboticsTools,
  },
]);
