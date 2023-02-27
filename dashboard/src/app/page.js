'use client';

import Link from 'next/link';
import Header from '@components/Header';
import Auth from '@components/Auth';
import LoadingFullScreen from '@components/LoadingFullScreen';
import { useAuth, VIEWS } from '@components/AuthProvider';

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
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
          <h2>Welcome!</h2>
          <code className="highlight">{user.role}</code>
          <Link className="button" href="/profile">
            Go to Profile
          </Link>
          <button type="button" className="button-inverse" onClick={signOut}>
            Sign Out
          </button>
        </main>
      </>
    );
  }

  return <Auth view={view} />;
}
