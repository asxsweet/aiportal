import { Link, useLocation } from 'react-router';
import { LayoutDashboard, FileText, Users, BarChart3, Cpu } from 'lucide-react';

interface SidebarProps {
  role: 'teacher' | 'student';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  
  const teacherLinks = [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/teacher/assignments/create', label: 'Assignments', icon: FileText },
    { path: '/teacher/students', label: 'Students', icon: Users },
    { path: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/tools', label: 'Robotics Tools', icon: Cpu },
  ];

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tools', label: 'Robotics Tools', icon: Cpu },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          RoboLearn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
        </p>
      </div>
      
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
