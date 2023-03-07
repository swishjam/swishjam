import DashboardView from '@/components/CWVDashboardView';
import AuthenticatedView from '@/components/AuthenticatedView';

export default function Home() {
   
  return (
    <AuthenticatedView>
      <DashboardView />
    </AuthenticatedView>
  );
}
