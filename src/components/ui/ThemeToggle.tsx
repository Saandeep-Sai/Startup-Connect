"use client";
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './Button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      {theme === 'dark' && <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      {theme === 'system' && <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
    </Button>
  );
}