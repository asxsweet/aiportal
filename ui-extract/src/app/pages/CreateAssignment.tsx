import { useState } from 'react';
import { useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { Calendar, FileText, CheckCircle } from 'lucide-react';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    tools: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);

  const handleToolToggle = (tool: string) => {
    if (formData.tools.includes(tool)) {
      setFormData({
        ...formData,
        tools: formData.tools.filter((t) => t !== tool),
      });
    } else {
      setFormData({
        ...formData,
        tools: [...formData.tools, tool],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    alert('Assignment created successfully!');
    navigate('/teacher/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Assignment</h1>
            <p className="text-gray-600">
              Set up a new robotics assignment for your students
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Line Following Robot Challenge"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide detailed instructions for the assignment..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Robotics Tools Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Select Robotics Tools *</h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose which tools students should use for this assignment
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleToolToggle('ev3')}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    formData.tools.includes('ev3')
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    {formData.tools.includes('ev3') && (
                      <CheckCircle className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">LEGO Mindstorms EV3</h3>
                  <p className="text-sm text-gray-600">
                    Build and program physical robots
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolToggle('tinkercad')}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    formData.tools.includes('tinkercad')
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    {formData.tools.includes('tinkercad') && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">Tinkercad</h3>
                  <p className="text-sm text-gray-600">
                    Design circuits and 3D models
                  </p>
                </button>
              </div>
            </div>

            {/* File Attachment Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Attach Resources (Optional)</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload instructions, templates, or reference materials
              </p>
              <FileUpload onFileSelect={setFile} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Create Assignment
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/dashboard')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
