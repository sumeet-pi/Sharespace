import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Heart, MessageCircle, Shield, BookOpen, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center space-x-2">
            <Heart className="text-green-600" size={32} fill="currentColor" />
            <h1 className="text-2xl font-bold text-gray-800">ShareSpace</h1>
          </div>
          <Button
            data-testid="nav-login-btn"
            onClick={() => navigate('/login')}
            variant="outline"
            className="rounded-full px-6"
          >
            Login
          </Button>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mt-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 antialiased leading-[1.25] sm:leading-[1.2] py-3 sm:py-4">
            Sometimes, healing starts
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 py-2 sm:py-3 leading-[1.05]">
              just by being heard
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A safe, supportive space where you can share your thoughts, track your journey, and connect through kindness. You're not alone in this journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Button
              data-testid="get-started-btn"
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Share Anonymously</h3>
            <p className="text-sm text-gray-600">
              Express yourself freely with protected identity
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Journal</h3>
            <p className="text-sm text-gray-600">
              Track reflections, gratitude, and daily thoughts
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mood Tracking</h3>
            <p className="text-sm text-gray-600">
              Visualize your emotional journey over time
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border border-pink-100">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="text-pink-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Moderation</h3>
            <p className="text-sm text-gray-600">
              Every comment is checked for kindness
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="max-w-3xl mx-auto mt-32 text-center">
          <blockquote className="text-2xl sm:text-3xl text-gray-700 italic font-light">
            "You're not alone in this journey. Together, we heal."
          </blockquote>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;