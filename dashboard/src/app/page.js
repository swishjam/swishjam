//import AuthenticatedView from '@components/Auth/AuthenticatedView';
import { API } from '@/lib/api-client/base';
import AuthenticatedView from '@/components/Auth/AuthenticatedView';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import ClickableValueCard from '@/components/DashboardComponents/ClickableValueCard';
// import ItemizedList from '@/components/DashboardComponents/ItemizedList';
import ItemizedUsersList from '@/components/DashboardComponents/Prebuilt/ItemizedUsersList';
import ItemizedOrganizationsList from '@/components/DashboardComponents/Prebuilt/ItemizedOrganizationList';
import ActiveUsersLineChart from '@/components/DashboardComponents/Prebuilt/ActiveUsersLineChart';
import { Separator } from "@/components/ui/separator"

const Home = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        test
    </main>
  );
}

export default Home;

//export default AuthenticatedView(Home, (<div>loading</div>));