import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentConsultations } from "@/components/dashboard/recent-consultations";
import { Notifications } from "@/components/dashboard/notifications";
import { QuickStart } from "@/components/dashboard/quick-start";
import { PatientSearch } from "@/components/dashboard/patient-search";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <DashboardHeader />
      
      <StatsCards />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2">
          <RecentConsultations />
        </div>
        <div className="flex flex-col gap-6">
          <QuickStart />
          <PatientSearch />
          <Notifications />
        </div>
      </div>
    </div>
  );
}