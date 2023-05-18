import { UserInvitation } from '@/lib/emails/user-invitation.js'

export default async (req, res) => {
  const result = await UserInvitation.send({
    to: 'collin@swishjam.com',
    variables: {
      invited_by_user: 'Some fucker',
      organization_name: 'da org',
      invitation_url: 'swishjam.com/register'
    }
  })
  return res.status(200).json(result)
}