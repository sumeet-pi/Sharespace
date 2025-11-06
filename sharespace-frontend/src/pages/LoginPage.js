import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Heart, Mail, Lock, User } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useUser } from "@/hooks/useUser";

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', name: '' });
  
  // Error states for login form
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });
  const [loginFailed, setLoginFailed] = useState(false); // For visual feedback on failed login
  const [loginFormError, setLoginFormError] = useState(''); // Inline error message below button
  
  // Error states for signup form
  const [signupErrors, setSignupErrors] = useState({ email: '', password: '', name: '' });
  const [signupTouched, setSignupTouched] = useState({ email: false, password: false, name: false });

  // Validation functions
  const validateLoginEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!isValidEmail(email)) {
      return 'Please enter a valid email address (e.g., example@email.com)';
    }
    return '';
  };

  const validateLoginPassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  const validateSignupEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!isValidEmail(email)) {
      return 'Please enter a valid email address (e.g., example@email.com)';
    }
    return '';
  };

  const validateSignupPassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Your password is too short. Please enter at least 6 characters.';
    }
    return '';
  };

  const validateSignupName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    return '';
  };

  // Handle blur events for login form
  const handleLoginBlur = (field) => {
    setLoginTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setLoginErrors(prev => ({ ...prev, email: validateLoginEmail(loginData.email) }));
    } else if (field === 'password') {
      setLoginErrors(prev => ({ ...prev, password: validateLoginPassword(loginData.password) }));
    }
  };

  // Handle blur events for signup form
  const handleSignupBlur = (field) => {
    setSignupTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setSignupErrors(prev => ({ ...prev, email: validateSignupEmail(signupData.email) }));
    } else if (field === 'password') {
      setSignupErrors(prev => ({ ...prev, password: validateSignupPassword(signupData.password) }));
    } else if (field === 'name') {
      setSignupErrors(prev => ({ ...prev, name: validateSignupName(signupData.name) }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear previous login failure state and form error
    setLoginFailed(false);
    setLoginFormError('');
    
    // Mark all fields as touched
    setLoginTouched({ email: true, password: true });
    
    // Validate all fields
    const emailError = validateLoginEmail(loginData.email);
    const passwordError = validateLoginPassword(loginData.password);
    
    setLoginErrors({ email: emailError, password: passwordError });
    
    // If there are validation errors, don't submit
    if (emailError || passwordError) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginData.email, password: loginData.password })
      });
      
      // Handle successful response
      if (result.ok && result.data) {
        let { token, user } = result.data;
        if (token) {
          localStorage.setItem('sharespace_token', token);
        }
        if (user) {
          // Normalize avatar to local path under /pfp and ensure profilePictureUrl is set
          const avatarFile = (user.avatar || '').replace(/^\/?pfp\//, '');
          const profilePictureUrl = user.profilePictureUrl?.startsWith('/pfp/')
            ? user.profilePictureUrl
            : (avatarFile ? `/pfp/${avatarFile}` : '/pfp/default.png');
          user = { ...user, profilePictureUrl };
          try { localStorage.setItem('sharespace_user', JSON.stringify(user)); } catch {}
          // Update global user context so Sidebar and others re-render immediately
          try { setUser(user); } catch {}
          if (typeof onLogin === 'function') onLogin(user);
        }
        
        // Clear errors on successful login
        setLoginErrors({ email: '', password: '' });
        setLoginTouched({ email: false, password: false });
        setLoginFailed(false);
        setLoginFormError('');
        
        if (sessionStorage.getItem('shownLoginToast') !== 'true') {
          toast.success('💚 Welcome back! Take a deep breath—you\'re in a safe space.');
          sessionStorage.setItem('shownLoginToast', 'true');
        }
        navigate('/dashboard');
        return;
      }
      
      // Handle error responses - map status codes to user-friendly messages
      // Only show one of three messages: invalid credentials, unable to connect, or server error
      const status = result?.status ?? 0;
      const errorMsg = (result?.message || '').toLowerCase();
      let errorMessage = '';
      
      // Priority 1: Check for authentication errors
      // Check status codes 401 or 400 first (always show invalid credentials for these)
      if (status === 401 || status === 400) {
        errorMessage = 'Invalid email or password.';
      }
      // Check message for authentication-related keywords
      else if (errorMsg.includes('invalid') || 
               errorMsg.includes('credentials') ||
               errorMsg.includes('unauthorized') ||
               errorMsg.includes('password') ||
               errorMsg.includes('email')) {
        errorMessage = 'Invalid email or password.';
      }
      // Priority 2: Check for network errors (status 0 = fetch failed, no internet, unreachable)
      else if (status === 0) {
        errorMessage = 'Invalid email or password.';
      }
      // Priority 3: Check for server errors (500-599)
      else if (status >= 500 && status < 600) {
        errorMessage = 'Something went wrong. Please try again later.';
      }
      // Default: Assume invalid credentials for any other error
      else {
        errorMessage = 'Invalid email or password.';
      }
      
      // Log error to console for debugging (silent to user - no technical errors shown)
      console.error('Login error:', { 
        status, 
        message: result?.message, 
        error: result?.error,
        ok: result?.ok 
      });
      
      // Show inline error message
      setLoginFailed(true);
      setLoginFormError(errorMessage);
      
      // Mark both fields as touched to show error
      setLoginTouched({ email: true, password: true });
      
    } catch (err) {
      // Catch any unexpected errors (shouldn't happen with new apiRequest structure)
      // Log silently to console
      console.error('Unexpected login error:', err);
      
      // Default to invalid credentials for unexpected errors
      setLoginFailed(true);
      setLoginFormError('Invalid email or password.');
      setLoginTouched({ email: true, password: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setSignupTouched({ email: true, password: true, name: true });
    
    // Validate all fields
    const emailError = validateSignupEmail(signupData.email);
    const passwordError = validateSignupPassword(signupData.password);
    const nameError = validateSignupName(signupData.name);
    
    setSignupErrors({ email: emailError, password: passwordError, name: nameError });
    
    // If there are validation errors, don't submit
    if (emailError || passwordError || nameError) {
      return;
    }
    
    setLoading(true);
    try {
      const signupRes = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: signupData.name, email: signupData.email, password: signupData.password })
      });
      
      if (!signupRes.ok) {
        throw new Error(signupRes.message || 'Signup failed');
      }
      
      // Try to use token from signup; if not present, auto-login
      let token = signupRes.data?.token;
      let user = signupRes.data?.user;

      if (!token) {
        const loginRes = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: signupData.email, password: signupData.password })
        });
        
        if (!loginRes.ok) {
          throw new Error(loginRes.message || 'Auto-login failed');
        }
        
        token = loginRes.data?.token;
        user = loginRes.data?.user;
      }

      if (token) {
        localStorage.setItem('sharespace_token', token);
      }
      if (user) {
        const avatarFile = (user.avatar || '').replace(/^\/?pfp\//, '');
        const profilePictureUrl = user.profilePictureUrl?.startsWith('/pfp/')
          ? user.profilePictureUrl
          : (avatarFile ? `/pfp/${avatarFile}` : '/pfp/default.png');
        const normalized = { ...user, profilePictureUrl };
        try { localStorage.setItem('sharespace_user', JSON.stringify(normalized)); } catch {}
        try { setUser(normalized); } catch {}
        if (typeof onLogin === 'function') onLogin(normalized);
      }

      toast.success('🎉 Welcome to ShareSpace!');
      navigate('/dashboard');
    } catch (err) {
      // Only show toast for backend errors (e.g., email already registered)
      toast.error(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Processing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/70 backdrop-blur-sm border-none shadow-xl">
        <div className="flex items-center justify-center mb-8">
          <Heart className="text-green-600 mr-2" size={32} fill="currentColor" />
          <h1 className="text-3xl font-bold text-gray-800">ShareSpace</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
            <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form 
              onSubmit={handleLogin} 
              noValidate 
              className="space-y-4 transition-all duration-300"
            >
              <div>
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    id="login-email"
                    data-testid="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => {
                      setLoginData({ ...loginData, email: e.target.value });
                      // Clear login failure state and form error when user starts typing
                      if (loginFailed || loginFormError) {
                        setLoginFailed(false);
                        setLoginFormError('');
                      }
                      // Clear error when user starts typing
                      if (loginTouched.email && loginErrors.email) {
                        setLoginErrors(prev => ({ ...prev, email: validateLoginEmail(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleLoginBlur('email')}
                    className={`pl-10 transition-colors ${
                      loginTouched.email && loginErrors.email
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : ''
                    }`}
                  />
                </div>
                {loginTouched.email && loginErrors.email && (
                  <p className="mt-1.5 text-xs text-red-500 animate-in fade-in-0 slide-in-from-top-1">
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    id="login-password"
                    data-testid="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => {
                      setLoginData({ ...loginData, password: e.target.value });
                      // Clear login failure state and form error when user starts typing
                      if (loginFailed || loginFormError) {
                        setLoginFailed(false);
                        setLoginFormError('');
                      }
                      // Clear error when user starts typing
                      if (loginTouched.password && loginErrors.password) {
                        setLoginErrors(prev => ({ ...prev, password: validateLoginPassword(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleLoginBlur('password')}
                    className={`pl-10 transition-colors ${
                      loginTouched.password && loginErrors.password
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : ''
                    }`}
                  />
                </div>
                {loginTouched.password && loginErrors.password && (
                  <p className="mt-1.5 text-xs text-red-500 animate-in fade-in-0 slide-in-from-top-1">
                    {loginErrors.password}
                  </p>
                )}
              </div>

              <Button
                data-testid="login-submit-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              
              {/* Inline error message below button - calm and minimal */}
              {loginFormError && (
                <p className="mt-3 text-xs text-red-400/80 text-center animate-in fade-in-0 slide-in-from-top-1 transition-opacity">
                  {loginFormError}
                </p>
              )}
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} noValidate className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    id="signup-name"
                    data-testid="signup-name"
                    type="text"
                    placeholder="Your name"
                    value={signupData.name}
                    onChange={(e) => {
                      setSignupData({ ...signupData, name: e.target.value });
                      // Clear error when user starts typing
                      if (signupTouched.name && signupErrors.name) {
                        setSignupErrors(prev => ({ ...prev, name: validateSignupName(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleSignupBlur('name')}
                    className={`pl-10 transition-colors ${
                      signupTouched.name && signupErrors.name
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : ''
                    }`}
                  />
                </div>
                {signupTouched.name && signupErrors.name && (
                  <p className="mt-1.5 text-xs text-red-500 animate-in fade-in-0 slide-in-from-top-1">
                    {signupErrors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    id="signup-email"
                    data-testid="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => {
                      setSignupData({ ...signupData, email: e.target.value });
                      // Clear error when user starts typing
                      if (signupTouched.email && signupErrors.email) {
                        setSignupErrors(prev => ({ ...prev, email: validateSignupEmail(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleSignupBlur('email')}
                    className={`pl-10 transition-colors ${
                      signupTouched.email && signupErrors.email
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : ''
                    }`}
                  />
                </div>
                {signupTouched.email && signupErrors.email && (
                  <p className="mt-1.5 text-xs text-red-500 animate-in fade-in-0 slide-in-from-top-1">
                    {signupErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    id="signup-password"
                    data-testid="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => {
                      setSignupData({ ...signupData, password: e.target.value });
                      // Clear error when user starts typing
                      if (signupTouched.password && signupErrors.password) {
                        setSignupErrors(prev => ({ ...prev, password: validateSignupPassword(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleSignupBlur('password')}
                    className={`pl-10 transition-colors ${
                      signupTouched.password && signupErrors.password
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : ''
                    }`}
                  />
                </div>
                {/* Always show helper text */}
                <p className="mt-1.5 text-xs text-gray-500">
                  Password must be at least 6 characters long.
                </p>
                {/* Show error message if validation fails */}
                {signupTouched.password && signupErrors.password && (
                  <p className="mt-1 text-xs text-red-500 animate-in fade-in-0 slide-in-from-top-1">
                    {signupErrors.password}
                  </p>
                )}
              </div>

              <Button
                data-testid="signup-submit-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-gray-600"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
