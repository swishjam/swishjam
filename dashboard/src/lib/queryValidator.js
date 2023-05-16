import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const noAccess = res => res.status(403).json({ error: 'Unauthorized' });

export class Validator {
  static async runQueryIfUserHasAccess({ req, res, organizationId, projectKey }, callback) {
    const supabase = createServerSupabaseClient({ req, res });
  
    const { data: { session: { user } }} = await supabase.auth.getSession();
    if (!user) return noAccess(res);
  
    const orgUsers = await supabase.from('organization_users').select('*').eq('user_id', user.id)
    if (orgUsers.error) return noAccess(res);

    const orgUserForOrg = orgUsers.data.find(({ organization_id }) => organization_id === organizationId);
    if (!orgUserForOrg) return noAccess(res);
  
    const projects = await supabase.from('projects').select('*').eq('organization_id', organizationId)
    if (projects.error) return noAccess(res);
  
    const requestedProject = projects.data.find(p => p.public_id === projectKey);
  
    if (requestedProject) {
      return await callback({ supabaseClient: supabase, organizationId, projects, user, currentProject: requestedProject });
    } else {
      return noAccess(res);
    }
  }
} 