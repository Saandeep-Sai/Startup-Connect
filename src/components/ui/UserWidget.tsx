"use client";
import { useContext } from 'react';
import { AuthContext } from '@/components/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { Menu, MenuItem } from '@headlessui/react';
import Link from 'next/link';

export function UserWidget() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      {user ? (
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-gray-900 dark:text-gray-100 font-medium hidden sm:block">
              {user.displayName || 'User'}
            </span>
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 z-50">
            <MenuItem>
              <Link
                href="/dashboard/profile"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
              >
                Profile
              </Link>
            </MenuItem>
            <MenuItem>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-5 h-5 inline mr-2" />
                Sign Out
              </button>
            </MenuItem>
          </Menu.Items>
        </Menu>
      ) : (
        <Button
          onClick={() => router.push('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Sign In
        </Button>
      )}
    </div>
  );
}