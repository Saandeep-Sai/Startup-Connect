"use client";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface StartupData {
  id: string;
  name: string;
  description?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};


export default function Admin() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [startups, setStartups] = useState<StartupData[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const usersQuery = await getDocs(collection(db, 'users'));
        setUsers(usersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData)));
        const startupsQuery = await getDocs(collection(db, 'startups'));
        setStartups(startupsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupData)));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [user, loading, router]);

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleDeleteStartup = async (startupId: string) => {
    try {
      await deleteDoc(doc(db, 'startups', startupId));
      setStartups(startups.filter(startup => startup.id !== startupId));
    } catch (err) {
      console.error('Error deleting startup:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Admin Panel</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} variant="elevated" className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                <p className="text-gray-600 dark:text-gray-300">Role: {user.role}</p>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.id)}
                  className="mt-4 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Startups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <Card key={startup.id} variant="elevated" className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{startup.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{startup.description || 'No description'}</p>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteStartup(startup.id)}
                  className="mt-4 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}