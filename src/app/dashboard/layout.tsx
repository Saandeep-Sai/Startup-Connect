"use client";
import { useContext, useState } from 'react';
import { AuthContext } from '@/components/AuthProvider';
import { NavLink } from '@/components/ui/NavLink';
import { UserWidget } from '@/components/ui/UserWidget';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={cn(
          'w-64 bg-white dark:bg-gray-800 shadow-lg p-6 h-screen lg:sticky lg:top-0 fixed top-0 z-40 transform transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8">Startup Connect</h1>
        <nav className="space-y-3">
          <NavLink href="/dashboard">Dashboard</NavLink>
          {user && (
            <>
              {user.role === 'admin' && <NavLink href="/dashboard/admin">Admin</NavLink>}
              {user.role === 'entrepreneur' && <NavLink href="/dashboard/entrepreneur">Entrepreneur</NavLink>}
              {user.role === 'investor' && <NavLink href="/dashboard/investor">Investor</NavLink>}
              <NavLink href="/dashboard/chats">Chats</NavLink>
              <NavLink href="/dashboard/posts">Posts</NavLink>
              <NavLink href="/dashboard/profile">Profile</NavLink>
            </>
          )}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-end items-center">
          <UserWidget />
        </header>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>

      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}