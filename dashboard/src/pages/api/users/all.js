import { Validator } from "@/lib/queryValidator";
import { createClient } from "@supabase/supabase-js";

export default async (req, res) => {
  return await Validator.runQueryIfUserHasAccess({ req, res }, async ({ organizationId }) => {
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);
    const { data: userData, error: usersError } = await supabaseClient
                                                    .from("organization_users")
                                                    .select(`user: user_id (id, created_at, email, name)`)
                                                    .eq('organization_id', organizationId);

    const { data: userInvitesData, error: userInvitesError } = await supabaseClient
                                                                .from("user_invites")
                                                                .select(`id, created_at, invited_email, invite_token`)
                                                                .eq('organization_id', organizationId)
                                                                .is('accepted_at', null);
    const users = [
      ...(userData || []).map(datum => ({ ...datum.user, status: 'accepted' })),
      ...(userInvitesData || []).map(userInvite => ({ 
        ...userInvite,
        email: userInvite.invited_email, 
        status: 'pending' 
      }))
    ]
    if (usersError || userInvitesError) {
      return res.status(400).json({ error: (usersError || userInvitesError).message });
    } else {
      return res.status(200).json({ users });
    }
  });
}