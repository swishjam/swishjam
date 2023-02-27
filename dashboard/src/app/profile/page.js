import Link from 'next/link';
import { redirect } from 'next/navigation';

import SignOut from 'src/components/SignOut';
import createClient from 'src/lib/supabase-server';

export default async function Profile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="card">
      <h2>User Profile</h2>
      <code className="highlight">{user.email}</code>
      <div className="heading">Last Signed In:</div>
      <code className="highlight">{new Date(user.last_sign_in_at).toUTCString()}</code>
      <Link className="button" href="/">
        Go Home
      </Link>
      <SignOut />
    </div>
  );
}
