import { Validator } from "@/lib/queryValidator";
import { createClient } from "@supabase/supabase-js";

export default async (req, res) => {
  const { userId, organizationId } = req.body;

  // runQueryIfUserHasAccess checks if the user belongs to the provided org, 
  return await Validator.runQueryIfUserHasAccess({ req, res }, async () => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);
    const { error } = await supabase.from("organization_users").delete().eq("user_id", userId).eq("organization_id", organizationId);

    if (error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(200).json({ success: true });
    }
  });
}