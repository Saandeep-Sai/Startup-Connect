/* src/app/login/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const sideAnimationVariants = {
  initial: { opacity: 0, x: -50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

const circleVariants = {
  initial: { opacity: 0, scale: 0.8, y: 0 },
  animate: {
    opacity: 1,
    scale: [1, 1.1, 1],
    y: [0, -20, 0],
    boxShadow: [
      "0 0 10px rgba(59, 130, 246, 0.5)",
      "0 0 20px rgba(59, 130, 246, 0.8)",
      "0 0 10px rgba(59, 130, 246, 0.5)",
    ],
    transition: {
      duration: 2,
      yoyo: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Login successful! Redirecting to dashboard...",
        className: "bg-green-500 text-white",
      });
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/user-not-found"
          ? "User not found"
          : error.code === "auth/wrong-password"
          ? "Incorrect password"
          : "Login failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden">
      {/* Left Side Animation */}
      <motion.div
        variants={sideAnimationVariants}
        initial="initial"
        animate="animate"
        className="hidden md:block absolute left-0 top-0 h-full w-1/4"
      >
        <motion.div
          variants={circleVariants}
          className="w-16 h-16 bg-blue-200 dark:bg-blue-700 rounded-full absolute top-1/4 left-10"
        />
        <motion.div
          variants={circleVariants}
          className="w-12 h-12 bg-blue-300 dark:bg-blue-600 rounded-full absolute top-1/2 left-20"
        />
        <motion.div
          variants={circleVariants}
          className="w-20 h-20 bg-blue-100 dark:bg-blue-800 rounded-full absolute bottom-1/4 left-16"
        />
      </motion.div>
      {/* Right Side Animation */}
      <motion.div
        variants={sideAnimationVariants}
        initial="initial"
        animate="animate"
        className="hidden md:block absolute right-0 top-0 h-full w-1/4"
      >
        <motion.div
          variants={circleVariants}
          className="w-16 h-16 bg-blue-200 dark:bg-blue-700 rounded-full absolute top-1/3 right-12"
        />
        <motion.div
          variants={circleVariants}
          className="w-14 h-14 bg-blue-300 dark:bg-blue-600 rounded-full absolute top-2/3 right-20"
        />
        <motion.div
          variants={circleVariants}
          className="w-18 h-18 bg-blue-100 dark:bg-blue-800 rounded-full absolute bottom-1/5 right-16"
        />
      </motion.div>
      {/* Main Content */}
      <Card
        variant="elevated"
        className="w-full max-w-md p-6 card-hover z-10 bg-white dark:bg-gray-800"
        style={{
          boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3), 0 0 20px rgba(124, 58, 237, 0.2)",
        }}
      >
        <motion.div variants={pageVariants} initial="initial" animate="animate">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Logo />
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center">
              Login
            </h1>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button type="submit" aria-label="Sign In" className="w-full btn-primary">
                Sign In
              </Button>
            </motion.div>
          </form>
          <p className="text-gray-600 dark:text-gray-300 mt-6 text-center">
            Don’t have an account?{" "}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </Card>
    </div>
  );
}