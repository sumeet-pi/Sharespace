import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Heart, Home, MessageCircle, BookOpen, TrendingUp, Library, Wind, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from "@/hooks/useUser";
import { resolveAvatarUrl } from "@/lib/utils";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const taglines = [
    'Your safe space for healing.',
    'Breathe. Reflect. Heal.',
    "You’re not alone here.",
    'Progress, not perfection.'
  ];
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);

  // Sidebar relies solely on user from context; no localStorage reads here.
  

  useEffect(() => {
    const interval = setInterval(() => {
      // fade out
      setTaglineVisible(false);
      // after fade-out, switch text and fade in
      const timeout = setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
        setTaglineVisible(true);
      }, 350);
      return () => clearTimeout(timeout);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageCircle, label: 'Feed', path: '/feed' },
    { icon: BookOpen, label: 'Journal', path: '/journal' },
    { icon: TrendingUp, label: 'Mood Tracker', path: '/mood' },
    { icon: Library, label: 'Resources', path: '/resources' },
    { icon: Wind, label: 'Calm Tools', path: '/calm' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white/70 backdrop-blur-sm border-r border-gray-200 shadow-lg">
      <div className="h-full flex flex-col p-6">
        {/* Top Section: Logo and Navigation */}
        <div className="flex-shrink-0">
          <div className="px-4 py-3 mb-4 border-b border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-400 flex items-center justify-center shadow-md shadow-green-200/60 mb-2">
                <Heart className="text-white" size={20} fill="currentColor" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 leading-none">ShareSpace</h1>
              <div className="mt-3 h-10 w-full flex items-center justify-center">
                <p
                  className={`text-sm text-gray-600 italic transition-opacity duration-500 whitespace-nowrap truncate max-w-full ${
                    taglineVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {taglines[taglineIndex]}
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile and Logout - Fixed at bottom of sidebar container */}
        <div className="flex-shrink-0 mt-auto pt-6">
          <div className="h-px bg-gray-200/80 mb-4" />
          {/* Bottom Profile Card */}
          <button
            onClick={() => navigate('/profile')}
            className={`w-full flex flex-col sm:flex-row items-center justify-center sm:justify-start p-3 sm:p-4 rounded-2xl border transition-colors mb-4 ${
              window.location.pathname === '/profile'
                ? 'bg-green-100 text-green-700 border-green-200 shadow'
                : 'bg-green-100 hover:bg-green-200 text-gray-700 border-green-100'
            }`}
          >
            <div className="flex items-center space-x-3 w-full">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white shadow-sm flex-shrink-0">
                {(() => {
                  // Accept either a full '/pfp/filename.png' or a bare 'filename.png'
                  const raw = (user?.profilePictureUrl || user?.avatar || 'default.png');
                  const fileName = raw.replace(/^\/?pfp\//, '');
                  const normalizedPath = `/pfp/${fileName}`;
                  const src = resolveAvatarUrl(normalizedPath);
                  const defaultSrc = resolveAvatarUrl('/pfp/default.png');
                  const finalSrc = src || defaultSrc;
                  return finalSrc ? (
                    <AvatarImage
                      src={finalSrc}
                      alt={user?.name || 'User'}
                      onError={(e) => { if (defaultSrc) e.currentTarget.src = defaultSrc; }}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xs sm:text-sm font-semibold">
                      {(user?.name || 'U')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  );
                })()}
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm truncate block text-center sm:text-left">{user?.name || 'User'}</span>
              </div>
            </div>
          </button>

          <Button
            data-testid="logout-btn"
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
