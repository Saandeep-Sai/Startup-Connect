"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import { NotificationBell } from "@/components/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoURL: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function UserProfile() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = typeof params?.userId === "string" ? params.userId : null;

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view profiles.",
          variant: "destructive",
        });
        router.push("/login");
      }
      return;
    }

    const fetchUserProfile = async () => {
      if (!userId) {
        toast({
          title: "Invalid User",
          description: "User ID is missing.",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setProfileData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            role: data.role || "",
            photoURL: data.photoURL || "",
          });
        } else {
          toast({
            title: "Error",
            description: "User profile not found.",
            variant: "destructive",
          });
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, authLoading, userId, router, toast]);

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>
    );
  }

  if (!profileData) {
    return null; // Redirect will handle this
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-6 ml-0 lg:ml-64 max-w-4xl mx-auto"
    >
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          {profileData.firstName} {profileData.lastName}s Profile
        </h1>
        <NotificationBell />
      </header>
      <Card
        variant="elevated"
        className="p-8 bg-white dark:bg-gray-800 card-hover"
      >
        <div className="flex items-center gap-6 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={profileData.photoURL || "/images/avatar.png"}
              alt="Profile"
            />
            <AvatarFallback>
              <User className="w-10 h-10 text-gray-500" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {profileData.role}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {profileData.email || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {profileData.role || "N/A"}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
