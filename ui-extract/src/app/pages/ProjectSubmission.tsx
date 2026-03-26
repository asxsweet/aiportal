import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { Users, CheckCircle } from 'lucide-react';

export default function ProjectSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tools: [] as string[],
    teamMembers: [''],
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

  const handleAddTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, ''],
    });
  };

  const handleRemoveTeamMember = (index: number) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter((_, i) => i !== index),
    });
  };

  const handleTeamMemberChange = (index: number, value: string) => {
    const updated = [...formData.teamMembers];
    updated[index] = value;
    setFormData({ ...formData, teamMembers: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Project submitted successfully!');
    navigate(`/project/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Submit Your Project</h1>
            <p className="text-gray-600">
              Complete the form below to submit your robotics project
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Project Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Advanced Line Following Robot"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your project, approach, challenges faced, and results..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tools Used Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Tools Used *</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select all tools you used in this project
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
                  <p className="text-sm text-gray-600">Physical robot platform</p>
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
                  <p className="text-sm text-gray-600">Circuit design tool</p>
                </button>
              </div>
            </div>

            {/* File Upload Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Project Files *</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload your code, documentation, and demonstration video (ZIP format recommended)
              </p>
              <FileUpload
                onFileSelect={setFile}
                acceptedFormats=".zip,.pdf,.doc,.docx,.mp4"
                label=""
              />
            </div>

            {/* Team Members Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Team Members
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add your team members (optional for solo projects)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
                >
                  + Add Member
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Team member ${index + 1} name`}
                    />
                    {formData.teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(index)}
                        className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Submit Project
              </button>
              <button
                type="button"
                onClick={() => navigate(`/assignment/${id}`)}
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
