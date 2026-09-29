import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/FormFields';
import type { Role } from '../../types';

const DEMO_CREDENTIALS = [
  { email: 'cm@platform.in', role: 'consent-manager' as Role, label: 'Consent Manager' },
  { email: 'ananya@collegeb.edu', role: 'org-user' as Role, label: 'Organization User' },
  { email: 'rahul@email.com', role: 'data-principal' as Role, label: 'Data Principal' },
  { email: 'meera@collegeb.edu', role: 'org-admin' as Role, label: 'Org Administrator' },
];

const ROUTES: Record<Role, string> = {
  'consent-manager': '/cm/dashboard',
  'org-user': '/org/dashboard',
  'data-principal': '/dp/dashboard',
  'org-admin': '/admin/dashboard',
};

export function LoginPage() {
  const { login, setRole } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    // Simulate a brief delay
    await new Promise(r => setTimeout(r, 700));

    // Check demo credentials
    const demo = DEMO_CREDENTIALS.find(d => d.email === email);
    if (demo) {
      setRole(demo.role);
      login();
      navigate(ROUTES[demo.role]);
    } else {
      // Default login → consent manager
      setRole('consent-manager');
      login();
      navigate('/cm/dashboard');
    }
    setLoading(false);
  };

  const handleDemoLogin = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setRole(cred.role);
    login();
    navigate(ROUTES[cred.role]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Consent Manager</h1>
          <p className="text-sm text-gray-500 mt-1">DEPA-Based Data Sharing Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@organization.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-9 text-sm bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            This is a demonstration prototype. No real authentication is used.
          </p>
        </div>

        {/* Demo Quick Login */}
        <div className="mt-5">
          <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wide">
            Presentation Demo — Quick Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map(cred => (
              <button
                key={cred.role}
                onClick={() => handleDemoLogin(cred)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <span className="font-medium block">{cred.label}</span>
                <span className="text-gray-400 text-[10px]">{cred.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
