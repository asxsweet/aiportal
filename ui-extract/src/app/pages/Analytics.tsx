import Sidebar from '../components/Sidebar';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award, Target } from 'lucide-react';

export default function Analytics() {
  // Mock data for charts
  const performanceData = [
    { name: 'Week 1', avgScore: 75, submissions: 20 },
    { name: 'Week 2', avgScore: 78, submissions: 22 },
    { name: 'Week 3', avgScore: 82, submissions: 24 },
    { name: 'Week 4', avgScore: 85, submissions: 23 },
    { name: 'Week 5', avgScore: 87, submissions: 25 },
    { name: 'Week 6', avgScore: 88, submissions: 24 },
  ];

  const assignmentData = [
    { name: 'Line Following', completed: 23, pending: 2 },
    { name: 'Circuit Design', completed: 20, pending: 5 },
    { name: 'Navigation System', completed: 15, pending: 10 },
    { name: 'Sensor Integration', completed: 18, pending: 7 },
  ];

  const gradeDistribution = [
    { name: 'A (90-100)', value: 35, color: '#10b981' },
    { name: 'B (80-89)', value: 45, color: '#3b82f6' },
    { name: 'C (70-79)', value: 15, color: '#f59e0b' },
    { name: 'D (60-69)', value: 5, color: '#ef4444' },
  ];

  const toolUsage = [
    { name: 'EV3 Only', value: 40, color: '#f97316' },
    { name: 'Tinkercad Only', value: 30, color: '#06b6d4' },
    { name: 'Both Tools', value: 30, color: '#8b5cf6' },
  ];

  const topStudents = [
    { name: 'Sarah Chen', avgScore: 95, assignments: 8, rank: 1 },
    { name: 'Michael Brown', avgScore: 93, assignments: 8, rank: 2 },
    { name: 'Emma Wilson', avgScore: 91, assignments: 8, rank: 3 },
    { name: 'James Taylor', avgScore: 89, assignments: 7, rank: 4 },
    { name: 'Sofia Martinez', avgScore: 88, assignments: 8, rank: 5 },
  ];

  const stats = [
    { label: 'Total Students', value: '124', change: '+12%', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Avg. Class Score', value: '87%', change: '+5%', icon: Award, color: 'from-green-500 to-green-600' },
    { label: 'Completion Rate', value: '92%', change: '+8%', icon: Target, color: 'from-purple-500 to-purple-600' },
    { label: 'Engagement', value: '94%', change: '+3%', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Track student performance and class progress
            </p>
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
                    <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Performance Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Performance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={3} name="Average Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Assignment Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Assignment Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assignmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Grade Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Grade Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tool Usage */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Tool Usage</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={toolUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {toolUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {toolUsage.map((tool) => (
                  <div key={tool.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tool.color }} />
                    <span className="text-gray-700">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Weekly Submissions</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="submissions" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Students Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Top Performing Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed Assignments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topStudents.map((student) => (
                    <tr key={student.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          student.rank === 2 ? 'bg-gray-100 text-gray-700' :
                          student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {student.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-green-600">{student.avgScore}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {student.assignments}/8
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                              style={{ width: `${student.avgScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
