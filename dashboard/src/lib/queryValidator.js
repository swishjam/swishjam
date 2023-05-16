import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const noAccess = res => res.status(403).json({ error: 'Unauthorized' });
const invalid = (res, msg) => res.status(400).json({ error: msg || 'Invalid request' });

export class Validator {
  static async runQueryIfUserHasAccess({ req, res }, callback) {
    const { organizationId, projectKey } = req.query;
    if (!organizationId) return invalid(res, 'Missing `organizationId` query param');
    if (!projectKey) return invalid(res, 'Missing `projectKey` query param');

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