'use client';
import Link from 'next/link';
import Header from '@components/Header';
import Auth from '@components/Auth';
import LoadingFullScreen from '@components/LoadingFullScreen';
import { useAuth, VIEWS } from '@components/AuthProvider';
import DashboardView from '@/components/DashboardView';
import { useEffect } from 'react';

export default function Home() {
  const { initial, user, view, signOut } = useAuth();

  if (initial) {
    return <LoadingFullScreen />;
  }

  if (view === VIEWS.UPDATE_PASSWORD) {
    return <Auth view={view} />;
  }

  if (user) {
    return (
      <>
        <Header />
        <DashboardView />
      </>
    );
  }

  return <Auth view={view} />;
}
