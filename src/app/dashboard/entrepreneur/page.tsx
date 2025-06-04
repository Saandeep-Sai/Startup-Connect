"use client";

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface StartupData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Entrepreneur() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'entrepreneur')) {
      toast({
        title: "Access Denied",
        description: "Only entrepreneurs can access this page.",
        variant: "destructive",
      });
      router.push('/dashboard');
      return;
    }

    const fetchStartups = async () => {
      if (user) {
        try {
          const q = query(collection(db, 'startups'), where('ownerId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          setStartups(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupData)));
        } catch (error) {
          console.error("Error fetching startups:", error);
          toast({
            title: "Error",
            description: "Failed to load startups.",
            variant: "destructive",
          });
        }
      }
    };

    if (!loading) {
      fetchStartups();
    }
  }, [user, loading, router, toast]);

  const handleAddStartup = async () => {
    if (!name || !description || !user) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const startupRef = await addDoc(collection(db, 'startups'), {
        name,
        description,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        title: name,
        description,
        type: 'startup',
        createdAt: serverTimestamp(),
      });

      setStartups([...startups, { id: startupRef.id, name, description, ownerId: user.uid }]);
      setName('');
      setDescription('');
      toast({
        title: "Success",
        description: "Startup added successfully!",
      });
    } catch (err) {
      console.error('Error adding startup:', err);
      toast({
        title: "Error",
        description: "Failed to add startup. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Your Startups</h1>
      <Card variant="elevated" className="mb-6 p-6 bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Startup</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startup Name</label>
            <Input
              type="text"
              placeholder="Enter startup name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              variant="outline"
              className="text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <Input
              as="textarea"
              placeholder="Enter startup description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              variant="outline"
              className="text-black dark:text-white"
            />
          </div>
          <Button
            onClick={handleAddStartup}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Startup
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.map((startup) => (
          <Card key={startup.id} variant="elevated" className="p-6 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{startup.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{startup.description}</p>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}