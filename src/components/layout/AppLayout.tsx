import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import MobileNav from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="safe-area-top">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
