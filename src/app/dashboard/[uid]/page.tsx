"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { User, Bot, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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

export default function Profile() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    photoURL: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your profile.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              role: data.role || "",
              photoURL: data.photoURL || "",
            });
          } else {
            toast({
              title: "Error",
              description: "Profile not found.",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          toast({
            title: "Error",
            description: "Failed to load profile.",
            variant: "destructive",
          });
        }
      }
    };

    if (!loading && user) {
      fetchProfile();
    }
  }, [user, loading, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        photoURL: formData.photoURL,
      });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChatbot = () => {
    toast({
      title: "Chatbot",
      description: "Chatbot feature is coming soon!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-6 max-w-4xl mx-auto"
    >
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          Your Profile
        </h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Button
            onClick={handleChatbot}
            variant="outline"
            className="text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            <Bot className="w-5 h-5 mr-2" />
            Chatbot
          </Button>
        </div>
      </header>
      <Card
        variant="elevated"
        className="p-8 bg-white dark:bg-gray-800 card-hover"
      >
        <div className="flex items-center gap-6 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={formData.photoURL || "/images/avatar.png"}
              alt="Profile"
            />
            <AvatarFallback>
              <User className="w-10 h-10 text-gray-500" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{formData.role}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <Input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="text-black dark:text-white"
              variant="outline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <Input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="text-black dark:text-white"
              variant="outline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="text-black dark:text-white"
              variant="outline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <Input
              name="role"
              type="text"
              value={formData.role}
              disabled
              className="text-black dark:text-white"
              variant="outline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Picture URL
            </label>
            <Input
              name="photoURL"
              type="text"
              value={formData.photoURL}
              onChange={handleChange}
              className="text-black dark:text-white"
              variant="outline"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
