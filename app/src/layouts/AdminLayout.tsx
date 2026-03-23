import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      {/* Desktop: offset for sidebar. Mobile: offset for top bar + bottom nav */}
      <div className="flex-1 flex flex-col lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
