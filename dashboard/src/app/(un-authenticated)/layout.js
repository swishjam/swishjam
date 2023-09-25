import UnAuthenticatedView from '@/components/Auth/UnAuthenticatedView';

export default function layout({ children }) {
  return (
    <UnAuthenticatedView>
      {children}
    </UnAuthenticatedView>
  )
}