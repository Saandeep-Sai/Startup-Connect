"use client";

import { useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '@/components/AuthProvider';
import { LogOut, Home, User, MessageCircle, Bot, Users, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  name: string;
  id: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('DashboardLayout rendered for route:', pathname);
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Success", description: "Signed out successfully!" });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    }
  };

  const handleChatbot = () => {
    toast({ title: "Coming Soon", description: "Chatbot feature is coming soon!" });
  };

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  const navItems: NavItem[] = [
    { name: 'Dashboard', id: 'dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', id: 'profile', href: '/dashboard/profile', icon: User },
    { name: 'Chats', id: 'chats', href: '/dashboard/chats', icon: MessageCircle },
    { name: 'Posts', id: 'posts', href: '/dashboard/posts', icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin">
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Button
        variant="ghost"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        onClick={toggleMobileSidebar}
        aria-label={isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      <nav
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-lg p-6 flex flex-col justify-between z-40 transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:block lg:translate-x-0 lg:sticky lg:top-0 lg:bg-white dark:lg:bg-gray-900`}
      >
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
            Startup Connect
          </h2>
          <ul className="space-y-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.id === 'chats' && pathname.startsWith('/dashboard/chat'));
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 p-3 rounded-md transition-colors w-full ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    }`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-label={item.name}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
            {user.role === 'admin' && (
              <li>
                <Link
                  href="/dashboard/admin"
                  className={`flex items-center gap-2 p-3 rounded-md transition-colors w-full ${
                    pathname === '/dashboard/admin'
                      ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Admin"
                >
                  <Users className="w-5 h-5" />
                  Admin
                </Link>
              </li>
            )}
            {user.role === 'entrepreneur' && (
              <li>
                <Link
                  href="/dashboard/entrepreneur"
                  className={`flex items-center gap-2 p-3 rounded-md transition-colors w-full ${
                    pathname === '/dashboard/entrepreneur'
                      ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Entrepreneur"
                >
                  <Users className="w-5 h-5" />
                  Entrepreneur
                </Link>
              </li>
            )}
            {user.role === 'investor' && (
              <li>
                <Link
                  href="/dashboard/investor"
                  className={`flex items-center gap-2 p-3 rounded-md transition-colors w-full ${
                    pathname === '/dashboard/investor'
                      ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Investor"
                >
                  <Users className="w-5 h-5" />
                  Investor
                </Link>
              </li>
            )}
            <li>
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md w-full"
                onClick={handleChatbot}
                aria-label="Chatbot"
              >
                <Bot className="w-5 h-5" />
                Chatbot
              </Button>
            </li>
          </ul>
        </div>
        <Button
          variant="destructive"
          className="flex items-center gap-2 w-full"
          onClick={handleSignOut}
          aria-label="Sign Out"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </nav>

      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}