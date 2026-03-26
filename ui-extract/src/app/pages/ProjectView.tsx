import { useParams } from 'react-router';
import Sidebar from '../components/Sidebar';
import ToolBadge from '../components/ToolBadge';
import CommentSection from '../components/CommentSection';
import { FileDown, Users, Calendar, Bot, User, Award } from 'lucide-react';

export default function ProjectView() {
  const { id } = useParams();

  // Mock data
  const project = {
    id: id || '1',
    title: 'Advanced Line Following Robot',
    description: `
      This project implements an advanced line-following robot using the LEGO Mindstorms EV3 platform.
      
      Key Features:
      - PID controller for smooth line following
      - Color sensor calibration system
      - Adaptive speed control based on line curvature
      - Obstacle detection and avoidance
      
      The robot successfully completed the test track in 42 seconds with 98% accuracy.
    `,
    submittedDate: '2026-03-28',
    tools: ['ev3' as const, 'tinkercad' as const],
    teamMembers: ['Alex Johnson', 'Maria Garcia'],
    files: [
      { name: 'source_code.zip', size: '1.2 MB' },
      { name: 'documentation.pdf', size: '845 KB' },
      { name: 'demo_video.mp4', size: '15.3 MB' },
    ],
    aiEvaluation: {
      overallScore: 88,
      criteria: [
        { name: 'Code Quality', score: 90, feedback: 'Well-structured code with good commenting' },
        { name: 'Functionality', score: 92, feedback: 'Robot performs all required tasks effectively' },
        { name: 'Innovation', score: 85, feedback: 'Good use of PID controller' },
        { name: 'Documentation', score: 86, feedback: 'Clear documentation with diagrams' },
      ],
      feedback: 'Excellent implementation of line following algorithm. The PID controller shows good tuning and the robot demonstrates smooth movement. Consider adding more error handling for edge cases.',
    },
    teacherEvaluation: {
      score: 92,
      feedback: 'Outstanding work! Your implementation of the PID controller is impressive, and the documentation is thorough. The robot performed excellently during the live demonstration.',
      gradedDate: '2026-03-29',
    },
    finalScore: 90,
  };

  const comments = [
    {
      id: '1',
      author: 'Prof. Sarah Johnson',
      role: 'Teacher',
      content: 'Great work on the PID implementation! Your calibration approach is very effective.',
      timestamp: '2026-03-29 10:30 AM',
    },
    {
      id: '2',
      author: 'Alex Johnson',
      role: 'Student',
      content: 'Thank you! We spent a lot of time tuning the PID parameters.',
      timestamp: '2026-03-29 2:15 PM',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{project.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Submitted: {new Date(project.submittedDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Team: {project.teamMembers.join(', ')}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-white">{project.finalScore}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">Final Score</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Tools Used:</p>
              <div className="flex gap-2">
                {project.tools.map((tool) => (
                  <ToolBadge key={tool} tool={tool} size="md" />
                ))}
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-semibold mb-4">Project Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          {/* Project Files */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-semibold mb-4">Submitted Files</h2>
            <div className="space-y-3">
              {project.files.map((file, index) => (
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

          {/* AI Evaluation */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">AI Evaluation</h2>
                <p className="text-sm text-gray-600">Automated assessment and feedback</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {project.aiEvaluation.criteria.map((criterion) => (
                <div key={criterion.name} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{criterion.name}</h3>
                    <span className="text-lg font-bold text-blue-600">{criterion.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${criterion.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{criterion.feedback}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">Overall AI Feedback</h3>
              <p className="text-sm text-gray-700">{project.aiEvaluation.feedback}</p>
            </div>
          </div>

          {/* Teacher Evaluation */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold">Teacher Evaluation</h2>
                <p className="text-sm text-gray-600">
                  Graded on {new Date(project.teacherEvaluation.gradedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">
                    {project.teacherEvaluation.score}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">Teacher Feedback</h3>
              <p className="text-sm text-gray-700">{project.teacherEvaluation.feedback}</p>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection comments={comments} />
        </div>
      </div>
    </div>
  );
}
