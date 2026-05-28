'use client';

import { useAuth } from './AuthProvider';
import { SignInPage } from '@/components/auth/SignInPage';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return null; // AuthProvider shows loading spinner
  }

  if (!user) {
    return <SignInPage />;
  }

  if (requireAdmin && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm max-w-md w-full">
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-400">
              You don't have permission to access this page. Contact an admin for access.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
