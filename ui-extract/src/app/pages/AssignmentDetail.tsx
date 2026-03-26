import { useParams, Link } from 'react-router';
import Sidebar from '../components/Sidebar';
import ToolBadge from '../components/ToolBadge';
import StatusBadge from '../components/StatusBadge';
import { Calendar, FileDown, Upload, User } from 'lucide-react';

export default function AssignmentDetail() {
  const { id } = useParams();

  // Mock data
  const assignment = {
    id: id || '1',
    title: 'Line Following Robot - EV3',
    description: `
      In this assignment, you will build and program a robot that can autonomously follow a black line on a white surface.

      Requirements:
      - Use LEGO Mindstorms EV3 platform
      - Implement color sensor for line detection
      - Create smooth and accurate line following behavior
      - Test your robot on the provided test track

      Deliverables:
      1. Fully functional robot
      2. Source code with comments
      3. Video demonstration
      4. Written report (2-3 pages)
    `,
    dueDate: '2026-03-30',
    status: 'pending' as const,
    tools: ['ev3' as const],
    attachments: [
      { name: 'Assignment_Instructions.pdf', size: '245 KB' },
      { name: 'Test_Track_Template.pdf', size: '128 KB' },
    ],
    instructor: 'Prof. Sarah Johnson',
    createdDate: '2026-03-15',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{assignment.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {assignment.instructor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted: {new Date(assignment.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <StatusBadge status={assignment.status} />
            </div>

            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="font-semibold text-lg">
                  {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <p className="text-sm text-gray-600 mb-2">Required Tools</p>
                <div className="flex gap-2">
                  {assignment.tools.map((tool) => (
                    <ToolBadge key={tool} tool={tool} size="md" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-semibold mb-4">Description & Requirements</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                {assignment.description}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {assignment.attachments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
              <h2 className="text-xl font-semibold mb-4">Attached Files</h2>
              <div className="space-y-3">
                {assignment.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileDown className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex gap-4">
            <Link
              to={`/assignment/${id}/submit`}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Submit Project
            </Link>
            <Link
              to="/student/dashboard"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
