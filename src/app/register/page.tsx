/* src/app/register/page.tsx */
"use client";

import { useState, useContext } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { AuthContext } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { sendOtpAction } from "@/app/actions/authActions";
import { Logo } from "@/components/Logo";

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

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("entrepreneur");
  const [error, setError] = useState("");
  const { loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: `${firstName} ${lastName}` });
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        role,
        createdAt: new Date(),
        isActive: false,
      });

      const otpResponse = await sendOtpAction(email);
      if (!otpResponse.success) {
        throw new Error(otpResponse.message);
      }

      sessionStorage.setItem("activationEmail", email);

      toast({
        title: "Registration Successful",
        description: "Please check your email to activate your account.",
        className: "bg-green-500 text-white",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("entrepreneur");

      router.push("/activate");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(errorMessage);
      console.error("Error registering:", err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

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
            <div className="flex items-center gap-2">
              <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                Register
              </h2>
            </div>
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
          <div className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFirstName(e.target.value)
                }
                variant="outline"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLastName(e.target.value)
                }
                variant="outline"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                variant="outline"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                variant="outline"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                id="role"
                className="flex w-full rounded-lg px-4 py-2 text-base border-2 border-blue-500 dark:border-blue-400 bg-transparent text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="entrepreneur">Entrepreneur</option>
                <option value="investor">Investor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button aria-label="Register Account" className="w-full btn-primary">
                Register
              </Button>
            </motion.div>
          </div>
          <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </Card>
    </div>
  );
}