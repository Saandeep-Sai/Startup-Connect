"use client";

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface SearchFilters {
  query: string;
  industry?: string;
  fundingStage?: string;
  location?: string;
  investmentRange?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  type: 'startups' | 'investors';
}

const filterVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
};

export default function AdvancedSearch({ onSearch, type }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [fundingStage, setFundingStage] = useState('');
  const [location, setLocation] = useState('');
  const [investmentRange, setInvestmentRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({ query, industry, fundingStage, location, investmentRange });
  };

  return (
    <motion.div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <Input
          type="text"
          placeholder={`Search ${type}...`}
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          className="text-black dark:text-white"
        />
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
        >
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </Button>
      </div>
      <motion.div
        variants={filterVariants}
        initial="hidden"
        animate={showFilters ? 'visible' : 'hidden'}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <Select onValueChange={setIndustry}>
          <SelectTrigger className="text-black dark:text-white">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="health">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </SelectContent>
        </Select>
        {type === 'startups' && (
          <Select onValueChange={setFundingStage}>
            <SelectTrigger className="text-black dark:text-white">
              <SelectValue placeholder="Funding Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pre-seed">Pre-seed</SelectItem>
              <SelectItem value="seed">Seed</SelectItem>
              <SelectItem value="series-a">Series A</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="text-black dark:text-white">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usa">USA</SelectItem>
            <SelectItem value="india">India</SelectItem>
            <SelectItem value="europe">Europe</SelectItem>
          </SelectContent>
        </Select>
        {type === 'investors' && (
          <Select value={investmentRange} onValueChange={setInvestmentRange}>
            <SelectTrigger className="text-black dark:text-white">
              <SelectValue placeholder="Investment Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-100k">$0-$100k</SelectItem>
              <SelectItem value="100k-500k">$100k-$500k</SelectItem>
              <SelectItem value="500k+">$500k+</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button
          onClick={handleSearch}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 to-purple-700 text-white"
        >
          Search
        </Button>
      </motion.div>
    </motion.div>
  );
}