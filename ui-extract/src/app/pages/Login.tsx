import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bot, Mail, Lock, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - redirect based on role
    if (role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bot className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              RoboLearn
            </h1>
          </div>
          <p className="text-gray-600">Welcome back! Please login to your account.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Login</h2>

          {/* Role Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                role === 'student'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <User className="w-5 h-5" />
              Student
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                role === 'teacher'
                  ? 'border-purple-500 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <User className="w-5 h-5" />
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
