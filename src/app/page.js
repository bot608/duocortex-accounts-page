'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (authenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [authenticated, loading, router]);

  return null;
}
