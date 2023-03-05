import DashboardView from '@/components/DashboardView';
import AuthenticatedView from '@/components/AuthenticatedView';

export default function Home() {
   
  return (
    <AuthenticatedView>
      <DashboardView />
    </AuthenticatedView>
  );
}
