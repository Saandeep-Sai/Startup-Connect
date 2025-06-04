"use client";

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [fetchingRole, setFetchingRole] = useState(false);

  // Fetch user role from Firestore if not in user object
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && !user.role) {
        setFetchingRole(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role || null);
            console.log('Fetched role from Firestore:', userData.role);
          } else {
            console.warn('No user document found in Firestore for UID:', user.uid);
            setRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } finally {
          setFetchingRole(false);
        }
      } else if (user && user.role) {
        setRole(user.role);
      }
    };

    fetchUserRole();
  }, [user]);

  // Handle redirects based on role
  useEffect(() => {
    console.log('Auth state:', { user: user ? { uid: user.uid, email: user.email, role: user?.role } : null, loading, role, fetchingRole });

    if (loading || fetchingRole) {
      // Wait for auth state and role fetch to complete
      return;
    }

    if (!user) {
      console.log('No user, redirecting to /login');
      router.push('/login');
      return;
    }

    /* if (role) {
      if (role === 'admin') {
        console.log('Redirecting to /dashboard/admin');
        router.push('/dashboard/admin');
      } else if (role === 'entrepreneur') {
        console.log('Redirecting to /dashboard/entrepreneur');
        router.push('/dashboard/entrepreneur');
      } else if (role === 'investor') {
        console.log('Redirecting to /dashboard/investor');
        router.push('/dashboard/investor');
      } else {
        console.warn('Invalid role:', role);
        // Optionally redirect to a fallback or error page
        router.push('/dashboard/profile');
      }
    } else {
      console.warn('No role defined for user, staying on /dashboard');
      // Keep user on dashboard until role is resolved
    } */
  }, [user, loading, role, fetchingRole, router]);

  if (loading || fetchingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will handle this
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Welcome to Your Dashboard</h1>
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {user.displayName || 'User'}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Role: {role || 'Loading...'}</p>
        <Button
          onClick={() => router.push('/dashboard/profile')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          View Profile
        </Button>
      </Card>
    </motion.div>
  );
}