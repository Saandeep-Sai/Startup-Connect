/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";
import AdvancedSearch from "@/components/AdvancedSearch";
import RequestInbox from "@/components/RequestInbox";
import { NotificationBell } from "@/components/NotificationBell";
import Testimonials from "@/components/Testimonials";
import Newsfeed from "@/components/Newsfeed";

interface StartupData {
  id: string;
  name: string;
  description: string;
  pitchDeck?: string;
  ownerId: string;
  industry?: string;
  location?: string;
  fundingStage?: string;
}

interface Request {
  requestId: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp | null;
}

interface User {
  id: string;
  name: string;
  verified?: boolean;
}

interface SearchFilters {
  query: string;
  industry?: string;
  fundingStage?: string;
  location?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Investor() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "investor")) {
      toast({
        title: "Access Denied",
        description: "Only investors can access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "startups"));
        setStartups(
          querySnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as StartupData)
          )
        );

        if (user?.uid) {
          const favResponse = await fetch(`/api/favorites?userId=${user.uid}`);
          const favData = await favResponse.json();
          if (!favResponse.ok)
            throw new Error(favData.error || "Failed to fetch favorites");
          setFavorites(
            favData.map((fav: { startupId: string }) => fav.startupId)
          );

          const reqResponse = await fetch(
            `/api/entrepreneur_requests?userId=${user.uid}`
          );
          const reqData = await reqResponse.json();
          if (!reqResponse.ok)
            throw new Error(reqData.error || "Failed to fetch requests");
          setRequests(reqData.received || []);

          const userIdsToFetch = new Set<string>(
            reqData.received.map((req: Request) => req.senderId)
          );
          const userPromises = Array.from(userIdsToFetch).map(async (uid) => {
            const userDoc = await getDoc(doc(db, "users", uid));
            return {
              id: uid,
              name: userDoc.exists()
                ? `${userDoc.data().firstName || ""} ${
                    userDoc.data().lastName || ""
                  }`.trim() || `User_${uid.slice(0, 8)}`
                : `User_${uid.slice(0, 8)}`,
              verified: userDoc.data()?.verified || false,
            } as User;
          });
          const users = await Promise.all(userPromises);
          setUserCache(new Map(users.map((u) => [u.id, u])));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        });
      }
    };

    if (!loading && user) {
      fetchData();
    }
  }, [user, loading, router, toast]);

  const handleInvestmentRequest = async (
    startupId: string,
    ownerId: string
  ) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "investment_requests"), {
        startupId,
        investorId: user.uid,
        ownerId,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      await addDoc(
        collection(db, `notifications/${ownerId}/userNotifications`),
        {
          type: "investment_request",
          senderId: user.uid,
          message: "You received a new investment request",
          createdAt: serverTimestamp(),
          read: false,
        }
      );
      toast({
        title: "Success",
        description: "Investment request sent!",
      });
    } catch (err) {
      console.error("Error sending request:", err);
      toast({
        title: "Error",
        description: "Failed to send request.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (startupId: string) => {
    if (!user) return;
    try {
      if (favorites.includes(startupId)) {
        const favResponse = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favoriteId: startupId }),
        });
        if (!favResponse.ok) throw new Error("Failed to remove favorite");
        setFavorites(favorites.filter((f) => f !== startupId));
        toast({
          title: "Success",
          description: "Startup removed from favorites.",
        });
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, startupId }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to add favorite");
        setFavorites([...favorites, startupId]);
        toast({
          title: "Success",
          description: "Startup added to favorites!",
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  const handleRequestAction = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      const response = await fetch("/api/entrepreneur_requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update request");
      setRequests(
        requests.map((req) =>
          req.requestId === requestId ? { ...req, status } : req
        )
      );
      toast({
        title: "Success",
        description: `Request ${status} successfully!`,
      });
    } catch (err) {
      console.error("Error updating request:", err);
      toast({
        title: "Error",
        description: "Failed to update request.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    let filtered = startups;
    if (filters.query) {
      filtered = filtered.filter((startup) =>
        startup.name.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    if (filters.industry) {
      filtered = filtered.filter(
        (startup) => startup.industry === filters.industry
      );
    }
    if (filters.fundingStage) {
      filtered = filtered.filter(
        (startup) => startup.fundingStage === filters.fundingStage
      );
    }
    if (filters.location) {
      filtered = filtered.filter(
        (startup) => startup.location === filters.location
      );
    }
    setStartups(filtered);
    setSearchFilters(filters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <motion.div className="flex-1 p-6 ml-0 lg:ml-64 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          Investor Dashboard
        </h1>
        <NotificationBell />
      </header>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Explore Startups {searchFilters.query && `for "${searchFilters.query}"`}
      </h2>
      <AdvancedSearch type="startups" onSearch={handleSearch} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.length === 0 ? (
          <div className="text-center text-lg text-gray-600 dark:text-gray-300 col-span-full">
            No startups found.
          </div>
        ) : (
          startups.map((startup) => (
            <Card
              key={startup.id}
              className="bg-white dark:bg-gray-800 card-hover"
            >
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">
                  {startup.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {startup.description}
                </p>
                {startup.pitchDeck && (
                  <a
                    href={startup.pitchDeck}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 block"
                  >
                    View Pitch Deck
                  </a>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() =>
                      handleInvestmentRequest(startup.id, startup.ownerId)
                    }
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  >
                    Send Investment Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleFavorite(startup.id)}
                    className={
                      favorites.includes(startup.id) ? "text-yellow-500" : ""
                    }
                  >
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <RequestInbox
        requests={requests}
        userCache={userCache}
        onAction={handleRequestAction}
      />
      <Testimonials />
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-8">
        Platform News
      </h2>
      <Newsfeed />
    </motion.div>
  );
}
