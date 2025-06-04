"use client";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface StartupData {
  id: string;
  name: string;
  description: string;
  pitchDeck?: string;
  ownerId: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};



export default function Investor() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'investor')) {
      router.push('/dashboard');
      return;
    }

    const fetchStartups = async () => {
      const querySnapshot = await getDocs(collection(db, 'startups'));
      setStartups(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupData)));
    };

    if (!loading) {
      fetchStartups();
    }
  }, [user, loading, router]);

  const handleInvestmentRequest = async (startupId: string, ownerId: string) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'investment_requests'), {
        startupId,
        investorId: user.uid,
        ownerId,
        status: 'pending',
        createdAt: new Date(),
      });
      alert('Investment request sent!');
    } catch (err) {
      console.error('Error sending request:', err);
    }
  };

  const filteredStartups = startups.filter(startup =>
    startup.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Explore Startups</h1>
      <Card variant="elevated" className="mb-6 p-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <Input
            type="text"
            placeholder="Search startups..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            variant="outline"
            className="text-blue-600 dark:text-blue-400"
          />
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map((startup) => (
          <Card key={startup.id} variant="elevated" className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{startup.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{startup.description}</p>
            {startup.pitchDeck && (
              <a
                href={startup.pitchDeck}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline mt-2 block"
              >
                View Pitch Deck
              </a>
            )}
            <Button
              onClick={() => handleInvestmentRequest(startup.id, startup.ownerId)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send Investment Request
            </Button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}