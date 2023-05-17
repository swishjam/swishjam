import { Validator } from "@/lib/queryValidator";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export default async (req, res) => {
  const { email } = req.body;

  return await Validator.runQueryIfUserHasAccess({ req, res }, async ({ organizationId, user }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);

    const { data: currentOrganizationUsers, error: organizationUsersError } = await supabase
                                                                              .from("organization_users")
                                                                              .select("organization_id, user:users(email)")
                                                                              .eq("organization_id", organizationId);
    if (organizationUsersError) throw new Error(organizationUsersError.message);
    const emailAlreadyBelongs = currentOrganizationUsers.find(({ user }) => user.email === email);
    console.log(emailAlreadyBelongs)
    if (emailAlreadyBelongs) throw new Error(`User ${email} already belongs to this organization`);

    const { data, error } = await supabase.from("user_invites").insert({
      organization_id: organizationId,
      invited_by_user_id: user.id,
      invite_token: crypto.randomUUID(),
      invited_email: email,
    }).select();

    if (error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(200).json({ userInvite: data[0] });
    }
  });
}

