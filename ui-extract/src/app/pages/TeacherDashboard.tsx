import Sidebar from '../components/Sidebar';
import { Link } from 'react-router';
import { Plus, Users, FileText, TrendingUp, Clock } from 'lucide-react';

export default function TeacherDashboard() {
  const stats = [
    { label: 'Total Students', value: '124', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Assignments', value: '8', icon: FileText, color: 'from-purple-500 to-purple-600' },
    { label: 'Pending Submissions', value: '23', icon: Clock, color: 'from-orange-500 to-orange-600' },
    { label: 'Avg. Performance', value: '87%', icon: TrendingUp, color: 'from-green-500 to-green-600' },
  ];

  const recentAssignments = [
    {
      id: 1,
      title: 'Line Following Robot - EV3',
      dueDate: '2026-03-30',
      submissions: 12,
      total: 25,
      tools: ['ev3' as const],
    },
    {
      id: 2,
      title: 'Circuit Design Challenge',
      dueDate: '2026-04-05',
      submissions: 18,
      total: 25,
      tools: ['tinkercad' as const],
    },
    {
      id: 3,
      title: 'Autonomous Navigation System',
      dueDate: '2026-04-10',
      submissions: 5,
      total: 25,
      tools: ['ev3' as const, 'tinkercad' as const],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
            <Link
              to="/teacher/assignments/create"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Assignment
            </Link>
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

          {/* Recent Assignments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Recent Assignments</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span>
                          Submissions: {assignment.submissions}/{assignment.total}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {assignment.tools.map((tool) => (
                          <span
                            key={tool}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              tool === 'ev3'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {tool === 'ev3' ? 'EV3' : 'Tinkercad'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-6">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">
                            {Math.round((assignment.submissions / assignment.total) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(assignment.submissions / assignment.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <Link
                        to={`/assignment/${assignment.id}`}
                        className="mt-4 block text-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Link
              to="/teacher/students"
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <Users className="w-10 h-10 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Manage Students</h3>
              <p className="text-sm text-gray-600">View and organize your student roster</p>
            </Link>

            <Link
              to="/teacher/analytics"
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <TrendingUp className="w-10 h-10 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">View Analytics</h3>
              <p className="text-sm text-gray-600">Track student performance and progress</p>
            </Link>

            <Link
              to="/tools"
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <FileText className="w-10 h-10 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Robotics Tools</h3>
              <p className="text-sm text-gray-600">Access EV3 and Tinkercad resources</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
