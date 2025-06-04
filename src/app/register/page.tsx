// src/app/register/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
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

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
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

      // Send OTP
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

      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("entrepreneur");

      router.push("/activate");
    } catch (err: unknown) {
      setError("Registration failed. Please try again.");
      console.error("Error registering:", err);
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card variant="elevated" className="w-full max-w-md p-6">
        <motion.div variants={pageVariants} initial="initial" animate="animate">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Register
            </h2>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <Input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFirstName(e.target.value)
                }
                variant="outline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <Input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLastName(e.target.value)
                }
                variant="outline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                variant="outline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                variant="outline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
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
              <Button onClick={handleRegister} className="w-full">
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
