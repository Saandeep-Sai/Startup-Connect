"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Users, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const featureCardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <motion.section
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center justify-center text-center py-20 px-4"
      >
        <motion.h1
          variants={fadeIn}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
        >
          Startup Connect
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8"
        >
          Bridging entrepreneurs and investors for collaborative success. Launch your startup or fund the next big idea with our secure, user-friendly platform—no upfront fees.
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            <Link href="/register">
              Join as Entrepreneur <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="px-6 py-3 rounded-lg border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
          >
            <Link href="/register">
              Join as Investor
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="px-6 py-3 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <Link href="/login">
              Login
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="py-16 px-4 md:px-8"
      >
        <motion.h2
          variants={fadeIn}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Why Choose Startup Connect?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <motion.div
            variants={featureCardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Users className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Registration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sign up as an entrepreneur or investor with our OTP-verified, secure process, free of high upfront costs.
            </p>
          </motion.div>
          <motion.div
            variants={featureCardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <DollarSign className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Streamlined Funding</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Entrepreneurs pitch startup ideas; investors browse and fund promising ventures with ease.
            </p>
          </motion.div>
          <motion.div
            variants={featureCardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Chat</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect instantly with investors or entrepreneurs via our integrated, real-time chat system.
            </p>
          </motion.div>
          <motion.div
            variants={featureCardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <CheckCircle className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Automated Notifications</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with email alerts for connection requests, investments, and platform activity.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="py-20 px-4 bg-blue-600 dark:bg-blue-800 text-white text-center"
      >
        <motion.h2
          variants={fadeIn}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Ready to Build the Future?
        </motion.h2>
        <motion.p
          variants={fadeIn}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
        >
          Whether you’re an entrepreneur with a bold idea or an investor seeking opportunities, Startup Connect is your platform for success.
        </motion.p>
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          variants={fadeIn}
        >
          <Button
            asChild
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg"
          >
            <Link href="/register">
              Get Started Now
              <motion.span
                animate={{ x: isHovered ? 10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600 dark:text-gray-400">
        <p>© 2025 Startup Connect. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/contact" className="hover:underline">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}