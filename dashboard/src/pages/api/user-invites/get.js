import { createClient } from "@supabase/supabase-js";

export default async (req, res) => {
  const { inviteToken } = req.query;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);
  const { data, error } = await supabase
                            .from("user_invites")
                            .select('*, organization:organization_id(*), invited_by_user:invited_by_user_id(id, email)')
                            .eq('invite_token', inviteToken);

  if (error) return res.status(400).json({ error: error.message });
  if (data.length === 0) return res.status(404).json({ error: 'Invite not found' });
  return res.status(200).json({ userInvite: data[0] });
}