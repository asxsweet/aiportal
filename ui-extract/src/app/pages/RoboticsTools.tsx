import Sidebar from '../components/Sidebar';
import { ExternalLink, Book, Video, FileText, Cpu, Box } from 'lucide-react';

export default function RoboticsTools() {
  const tools = [
    {
      id: 'tinkercad',
      name: 'Tinkercad',
      description: 'Design 3D models and circuits with our online design tool',
      icon: '⚡',
      color: 'from-cyan-400 to-blue-500',
      url: 'https://www.tinkercad.com',
      features: [
        '3D modeling and design',
        'Circuit simulation',
        'Block-based coding',
        'Export designs',
      ],
    },
    {
      id: 'ev3',
      name: 'LEGO Mindstorms EV3',
      description: 'Access guides and resources for building with EV3',
      icon: '🤖',
      color: 'from-yellow-400 to-orange-500',
      features: [
        'Building instructions',
        'Programming tutorials',
        'Sensor guides',
        'Project examples',
      ],
    },
  ];

  const learningResources = [
    {
      title: 'Getting Started with EV3',
      type: 'Guide',
      icon: Book,
      duration: '15 min read',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Line Following Tutorial',
      type: 'Video',
      icon: Video,
      duration: '20 min watch',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tinkercad Circuit Basics',
      type: 'Guide',
      icon: Book,
      duration: '10 min read',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Advanced Sensor Programming',
      type: 'Document',
      icon: FileText,
      duration: '25 min read',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'PID Control Tutorial',
      type: 'Video',
      icon: Video,
      duration: '30 min watch',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: '3D Printing for Robotics',
      type: 'Guide',
      icon: Book,
      duration: '12 min read',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Robotics Tools</h1>
            <p className="text-gray-600">
              Access your robotics platforms and learning resources
            </p>
          </div>

          {/* Main Tools */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className={`h-32 bg-gradient-to-r ${tool.color} flex items-center justify-center`}>
                  <span className="text-6xl">{tool.icon}</span>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{tool.name}</h2>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-sm text-gray-700">Key Features:</h3>
                    <ul className="space-y-2">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tool.url ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open {tool.name}
                    </a>
                  ) : (
                    <button className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                      <Book className="w-5 h-5" />
                      View Resources
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Learning Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Learning Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className={`w-12 h-12 ${resource.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${resource.color}`} />
                    </div>
                    <h3 className="font-semibold mb-2">{resource.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 ${resource.bgColor} ${resource.color} rounded-full text-xs font-medium`}>
                        {resource.type}
                      </span>
                      <span>• {resource.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Cpu className="w-10 h-10 mb-3 opacity-80" />
              <h3 className="font-semibold mb-2">Hardware Setup</h3>
              <p className="text-sm opacity-90">
                Ensure your EV3 brick is charged and all sensors are properly connected
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Box className="w-10 h-10 mb-3 opacity-80" />
              <h3 className="font-semibold mb-2">Testing</h3>
              <p className="text-sm opacity-90">
                Always test your robot in a controlled environment before final submission
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <Book className="w-10 h-10 mb-3 opacity-80" />
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm opacity-90">
                Keep detailed notes of your design decisions and challenges faced
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
