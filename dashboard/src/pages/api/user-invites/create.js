import { Validator } from "@/lib/queryValidator";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { UserInvitation } from "@/lib/emails/user-invitation";

export default async (req, res) => {
  const { email } = req.body;

  return await Validator.runQueryIfUserHasAccess({ req, res }, async ({ organizationId, user }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);

    const { data: currentOrganizationUsers, error: organizationUsersError } = await supabase
                                                                              .from("organization_users")
                                                                              .select("organization_id, user:users(email)")
                                                                              .eq("organization_id", organizationId);
    if (organizationUsersError) throw new Error(organizationUsersError.message);
    const emailAlreadyBelongs = currentOrganizationUsers.find(({ user }) => user.email.toLowerCase() === email.toLowerCase());
    if (emailAlreadyBelongs) throw new Error(`User ${email} already belongs to this organization`);

    // an email can have more than one pending invite until we implement this
    // const { data: currentPendingInvites, error: pendingInvitesError } = await supabase
    //                                                                           .from("user_invites")
    //                                                                           .select("organization_id, invited_email")
    //                                                                           .eq("organization_id", organizationId)
    //                                                                           .eq('accepted_at', null);


    const { data, error } = await supabase.from("user_invites").insert({
      organization_id: organizationId,
      invited_by_user_id: user.id,
      invite_token: crypto.randomUUID(),
      invited_email: email,
    }).select();

    if (error) {
      return res.status(400).json({ error: error.message });
    } else {
      if (process.env.DISABLE_TRANSACTION_EMAILS) {
        console.log(`Bypassing sending invite email to ${email} because DISABLE_TRANSACTION_EMAILS ENV is enabled.`)
      } else {
        const { data: organization } = await supabase.from("organizations").select("*").eq("id", organizationId).single();
        await UserInvitation.send({
          to: email,
          variables: {
            invited_by_user: user.email,
            organization_name: organization?.name,
            invitation_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://app.swishjam.com'}/invitation/${data[0].invite_token}`
          }
        })
      }

      return res.status(200).json({ userInvite: data[0] });
    }
  });
}

