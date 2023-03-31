import CwvDashboardView from '@/components/WebVitals/CWVDashboardView';
import AuthenticatedView from '@/components/AuthenticatedView';

export default function Home() {
   
  return (
    <AuthenticatedView>
      <CwvDashboardView />
    </AuthenticatedView>
  );
}
