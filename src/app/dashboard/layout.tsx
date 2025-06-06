"use client";

import { useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '@/components/AuthProvider';
import { LogOut, Home, User, MessageCircle, Bot, Users, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface NavItem {
  name: string;
  id: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true); // Sidebar visible by default

  useEffect(() => {
    console.log('DashboardLayout rendered for route:', pathname);
    // Do not close sidebar on route change to keep it visible
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <User className="w-8 h-8 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Button
        variant="ghost"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 text-gray-100"
        onClick={toggleMobileSidebar}
        aria-label={isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      <motion.nav
        initial={{ x: 0 }}
        animate={{ x: isMobileSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl p-6 flex flex-col justify-between z-40 lg:sticky lg:top-0"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
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
                    className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 w-full ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                        : 'text-gray-300 hover:bg-purple-500/10 hover:text-purple-300'
                    }`}
                    onClick={() => setIsMobileSidebarOpen(true)} // Keep sidebar open on mobile
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
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 w-full ${
                    pathname === '/dashboard/admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'text-gray-300 hover:bg-purple-500/10 hover:text-purple-300'
                  }`}
                  onClick={() => setIsMobileSidebarOpen(true)}
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
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 w-full ${
                    pathname === '/dashboard/entrepreneur'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'text-gray-300 hover:bg-purple-500/10 hover:text-purple-300'
                  }`}
                  onClick={() => setIsMobileSidebarOpen(true)}
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
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 w-full ${
                    pathname === '/dashboard/investor'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'text-gray-300 hover:bg-purple-500/10 hover:text-purple-300'
                  }`}
                  onClick={() => setIsMobileSidebarOpen(true)}
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
                className="flex items-center gap-2 p-3 text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 rounded-xl w-full transition-all duration-300"
                onClick={handleChatbot}
                aria-label="Chatbot"
              >
                <Bot className="w-5 h-5" />
                Chatbot
              </Button>
            </li>
          </ul>
        </motion.div>
        <Button
          variant="destructive"
          className="flex items-center gap-2 w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl"
          onClick={handleSignOut}
          aria-label="Sign Out"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </motion.nav>

      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <main className="flex-1"> {/* Reduced gap on desktop */}
        <motion.div variants={fadeInUp} className="max-w-6xl mx-auto">
          {children}
        </motion.div>
      </main>
    </div>
  );
}