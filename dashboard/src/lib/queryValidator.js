import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const noAccess = res => res.status(403).json({ error: 'Unauthorized' });

export class Validator {
  static async runQueryIfUserHasAccess({ req, res, projectKey }, callback) {
    const supabase = createServerSupabaseClient({ req, res });
  
    const { data: { session: { user } }} = await supabase.auth.getSession();
    if (!user) return noAccess(res);
  
    const orgUsers = await supabase.from('organization_users').select('*').eq('user_id', user.id)
    if (orgUsers.error) return noAccess(res);
  
    const orgs = await supabase.from('organizations').select('*').eq('id', orgUsers.data[0].organization_id)
    if (orgs.error) return noAccess(res);
  
    const projects = await supabase.from('projects').select('*').eq('organization_id', orgs.data[0].id)
    if (projects.error) return noAccess(res);
  
    const requestedProject = projects.data.find(p => p.public_id === projectKey);
  
    if (requestedProject) {
      return await callback({ supabaseClient: supabase, organizations: orgs, projects, user, currentProject: requestedProject });
    } else {
      return noAccess(res);
    }
  }
} 