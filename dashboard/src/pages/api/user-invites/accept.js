import { ONE_DAY_IN_MS } from '@/lib/utils/timeHelpers';
import { createClient } from '@supabase/supabase-js';

export default async (req, res) => {
  const { inviteToken, userId, email, password, methodOfAcceptance } = req.body;
  if (!['login', 'register', 'logged-in'].includes(methodOfAcceptance)) return res.status(400).json({ error: 'Invalid method of acceptance, valid values are `login`, `register`, or `logged-in`.' });

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);

    const { userInvite } = await verifyUserInviteIsValid({ inviteToken, supabase });

    if (methodOfAcceptance === 'logged-in') {
      await addUserToOrgAndAcceptInvite({ userInvite, userId, supabase });
    } else if (methodOfAcceptance === 'login') {
      await logUserInAndAcceptInvite({ email, password, userInvite, supabase });
    } else {
      await registerUserAndAcceptInvite({ email, password, userInvite, supabase });
    }

    return res.status(200).json({ success: true, message: 'Invite accepted' });
  } catch(err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
}

const verifyUserInviteIsValid = async ({ inviteToken, supabase }) => {
  const { data, error } = await supabase.from('user_invites').select('*').eq('invite_token', inviteToken);
  const userInvite = data[0];
  if (error) throw error;
  if (!userInvite) throw new Error('Invite not found.');

  const inviteIsExpired = new Date() - new Date(userInvite.created_at) > (parseInt(process.env.NEXT_PUBLIC_INVITE_EXPIRATION_DAYS || 14) * ONE_DAY_IN_MS);
  if (inviteIsExpired) throw new Error('Invite expired.');
  if (userInvite.accepted_at) throw new Error('Invite is invalid.');

  return { userInvite };
}

const addUserToOrgAndAcceptInvite = async ({ userInvite, userId, supabase }) => {
  const newOrganizationUser = await supabase.from('organization_users').insert({ organization_id: userInvite.organization_id, user_id: userId });
  if (newOrganizationUser.error) throw newOrg.error;

  const { error: userInviteAcceptanceError } = await supabase
    .from('user_invites')
    .update({ accepted_at: new Date(), accepted_by_user_id: userId })
    .eq('invite_token', userInvite.invite_token);
  if (userInviteAcceptanceError) throw userInviteAcceptanceError;
}

const registerUserAndAcceptInvite = async ({ email, password, userInvite, supabase }) => {
  const { data: { user }, error } = await supabase.auth.signUp({ email: email, password: password });
  if (error) throw error;

  const newUser = await supabase.from('users').insert({ id: user.id, email: user.email });
  if (newUser.error) throw newUser.error;

  await addUserToOrgAndAcceptInvite({ userInvite, userId: user.id, supabase });
}

const logUserInAndAcceptInvite = async ({ email, password, userInvite, supabase }) => {
  const { data: { user }, error } = await supabase.auth.signInWithPassword({ email: email, password: password });
  if (error) throw error;

  await addUserToOrgAndAcceptInvite({ userInvite, userId: user.id, supabase });
}