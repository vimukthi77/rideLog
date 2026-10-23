'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard/user');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B262C]">
      <div className="w-10 h-10 border-4 border-[#3282B8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
