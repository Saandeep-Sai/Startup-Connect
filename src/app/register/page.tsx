
/* src/app/register/page.tsx */
"use client";

import { useState, useContext } from "react";
import { createUserWithEmailAndPassword, updateProfile, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "@/firebase";
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

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } },
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
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    try {
      console.log("handleRegister: Stashing data for:", email);
      // 1️⃣ Stash form data in sessionStorage
      sessionStorage.setItem(
        "pendingRegistration",
        JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          createdAt: new Date().toISOString(),
        })
      );

      // 2️⃣ Set Firebase auth persistence
      await setPersistence(auth, browserSessionPersistence);

      // 3️⃣ Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("handleRegister: User created:", user.uid);

      // 4️⃣ Update user profile
      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      // 5️⃣ Update sessionStorage with uid
      const pending = JSON.parse(sessionStorage.getItem("pendingRegistration")!);
      pending.uid = user.uid;
      sessionStorage.setItem("pendingRegistration", JSON.stringify(pending));
      console.log("handleRegister: Updated sessionStorage with UID:", user.uid);

      // 6️⃣ Send OTP and store in sessionStorage
      const otpResponse = await sendOtpAction(email);
      if (!otpResponse.success) {
        throw new Error(otpResponse.message);
      }
      console.log("handleRegister: OTP sent:", otpResponse);
      sessionStorage.setItem('otpData', JSON.stringify({
        otp: otpResponse.otp,
        expiresAt: otpResponse.expiresAt,
      }));

      // 7️⃣ Show success toast and redirect
      toast({
        title: "OTP Sent",
        description: `Check ${email}`,
      });

      // Clear form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("entrepreneur");
      setError("");

      router.push("/activate");
    } catch (err: unknown) {
      let errorMessage = "Registration failed. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("handleRegister: Error:", err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      sessionStorage.removeItem("pendingRegistration");
      sessionStorage.removeItem("otpData");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Card
        variant="elevated"
        className="w-full max-w-md p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 z-10"
      >
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Logo />
            <div className="flex items-center gap-2">
              <UserPlus className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Register
              </h2>
            </div>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-3 bg-red-500/20 text-red-300 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                variant="outline"
                required
                className="bg-slate-900/50 text-gray-100 border-slate-700"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                variant="outline"
                required
                className="bg-slate-900/50 text-gray-100 border-slate-700"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                variant="outline"
                required
                className="bg-slate-900/50 text-gray-100 border-slate-700"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                variant="outline"
                required
                className="bg-slate-900/50 text-gray-100 border-slate-700"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                id="role"
                className="flex w-full rounded-lg px-4 py-2 text-base bg-slate-900/50 text-gray-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="entrepreneur">Entrepreneur</option>
                <option value="investor">Investor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                type="submit"
                aria-label="Register Account"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </motion.div>
          </form>
          <p className="mt-6 text-center text-gray-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:underline"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </Card>
    </div>
  );
}