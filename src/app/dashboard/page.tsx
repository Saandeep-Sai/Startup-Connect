/* eslint-disable @typescript-eslint/no-unused-vars */
/* src/app/dashboard/page.tsx */
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
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } },
};

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [fetchingRole, setFetchingRole] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && !user.role) {
        setFetchingRole(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || null);
          }
        } catch (error) {
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

  if (loading || fetchingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <User className="w-12 h-12 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 max-w-6xl mx-auto relative overflow-hidden"
    >
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
        Welcome to Your Dashboard
      </h1>
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-100">
            {user.displayName || 'User'}
          </h2>
        </div>
        <p className="text-gray-300 mb-6">Role: {role || 'Loading...'}</p>
        <Button
          onClick={() => router.push('/dashboard/profile')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full py-3"
        >
          View Profile
        </Button>
      </Card>
    </motion.div>
  );
}