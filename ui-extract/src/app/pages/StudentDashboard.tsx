import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import ToolBadge from '../components/ToolBadge';
import { Link } from 'react-router';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const assignments = [
    {
      id: 1,
      title: 'Line Following Robot - EV3',
      description: 'Build a robot that follows a black line on a white surface',
      dueDate: '2026-03-30',
      status: 'pending' as const,
      tools: ['ev3' as const],
      progress: 0,
    },
    {
      id: 2,
      title: 'Circuit Design Challenge',
      description: 'Design a LED circuit with a button switch',
      dueDate: '2026-04-05',
      status: 'submitted' as const,
      tools: ['tinkercad' as const],
      progress: 100,
    },
    {
      id: 3,
      title: 'Autonomous Navigation System',
      description: 'Create a robot that navigates through obstacles',
      dueDate: '2026-04-10',
      status: 'graded' as const,
      tools: ['ev3' as const, 'tinkercad' as const],
      progress: 100,
      grade: 92,
    },
    {
      id: 4,
      title: 'Sensor Integration Project',
      description: 'Integrate ultrasonic and color sensors',
      dueDate: '2026-03-20',
      status: 'overdue' as const,
      tools: ['ev3' as const],
      progress: 45,
    },
  ];

  const stats = [
    { label: 'Active Assignments', value: '4', icon: Clock, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: '12', icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Pending', value: '2', icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
    { label: 'Avg. Grade', value: '88%', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-gray-600">Track your assignments and progress</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Assignments List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">My Assignments</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {assignment.tools.map((tool) => (
                            <ToolBadge key={tool} tool={tool} size="sm" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      {assignment.grade && (
                        <div className="mb-3">
                          <span className="text-3xl font-bold text-green-600">
                            {assignment.grade}
                          </span>
                          <span className="text-gray-500">/100</span>
                        </div>
                      )}
                      <Link
                        to={`/assignment/${assignment.id}`}
                        className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                      >
                        {assignment.status === 'pending' || assignment.status === 'overdue'
                          ? 'Start Assignment'
                          : 'View Details'}
                      </Link>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {assignment.progress > 0 && assignment.status !== 'graded' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">{assignment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${assignment.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Link
              to="/tools"
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-3xl">🛠️</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Robotics Tools</h3>
                  <p className="text-sm text-gray-600">Access EV3 and Tinkercad</p>
                </div>
              </div>
            </Link>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
              <p className="text-sm opacity-90 mb-4">
                Check out our learning resources and guides
              </p>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-all font-medium text-sm">
                View Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
