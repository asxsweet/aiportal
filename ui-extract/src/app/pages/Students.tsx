import Sidebar from '../components/Sidebar';
import { Search, Mail, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');

  const students = [
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@school.edu',
      avgScore: 95,
      completedAssignments: 8,
      totalAssignments: 8,
      trend: 'up',
      lastActive: '2 hours ago',
    },
    {
      id: 2,
      name: 'Michael Brown',
      email: 'michael.brown@school.edu',
      avgScore: 93,
      completedAssignments: 8,
      totalAssignments: 8,
      trend: 'up',
      lastActive: '5 hours ago',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma.wilson@school.edu',
      avgScore: 91,
      completedAssignments: 8,
      totalAssignments: 8,
      trend: 'up',
      lastActive: '1 day ago',
    },
    {
      id: 4,
      name: 'James Taylor',
      email: 'james.taylor@school.edu',
      avgScore: 89,
      completedAssignments: 7,
      totalAssignments: 8,
      trend: 'down',
      lastActive: '3 hours ago',
    },
    {
      id: 5,
      name: 'Sofia Martinez',
      email: 'sofia.martinez@school.edu',
      avgScore: 88,
      completedAssignments: 8,
      totalAssignments: 8,
      trend: 'up',
      lastActive: '6 hours ago',
    },
    {
      id: 6,
      name: 'Daniel Lee',
      email: 'daniel.lee@school.edu',
      avgScore: 85,
      completedAssignments: 7,
      totalAssignments: 8,
      trend: 'up',
      lastActive: '2 days ago',
    },
    {
      id: 7,
      name: 'Olivia Davis',
      email: 'olivia.davis@school.edu',
      avgScore: 82,
      completedAssignments: 6,
      totalAssignments: 8,
      trend: 'down',
      lastActive: '4 hours ago',
    },
    {
      id: 8,
      name: 'Ethan Johnson',
      email: 'ethan.johnson@school.edu',
      avgScore: 78,
      completedAssignments: 6,
      totalAssignments: 8,
      trend: 'up',
      lastActive: '1 day ago',
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Students</h1>
            <p className="text-gray-600">Manage and track your student roster</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students by name or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-medium">
                Filter
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                Export
              </button>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{student.name}</h3>
                        {student.trend === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Mail className="w-4 h-4" />
                        {student.email}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Average Score</p>
                          <p className="text-2xl font-bold text-green-600">{student.avgScore}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Completion</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {student.completedAssignments}/{student.totalAssignments}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Last Active</p>
                          <p className="text-lg font-semibold text-gray-700">{student.lastActive}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-semibold">
                            {Math.round((student.completedAssignments / student.totalAssignments) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(student.completedAssignments / student.totalAssignments) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm">
                      View Details
                    </button>
                    <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium text-sm">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500 text-lg">No students found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
