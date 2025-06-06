/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import AdvancedSearch from "@/components/AdvancedSearch";
import { InvestorCard } from "@/components/InvestorCard";
import { NotificationBell } from "@/components/NotificationBell";
import Testimonials from "@/components/Testimonials";
import Newsfeed from "@/components/Newsfeed";
import { Timestamp } from "firebase/firestore";

interface StartupData {
  id: string;
  name: string;
  description: string;
  pitchDeck?: string;
  ownerId: string;
}

interface Investor {
  id: string;
  name: string;
  photoURL?: string;
  verified?: boolean;
  industry?: string;
  location?: string;
  investmentRange?: string;
}

interface Request {
  requestId: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp | null;
}

interface InvestmentRequest {
  requestId: string;
  startupId: string;
  investorId: string;
  ownerId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp | null;
}

interface SearchFilters {
  query: string;
  industry?: string;
  location?: string;
  investmentRange?: string;
}

interface SelectedChat {
  investorId: string;
  startupId: string;
}

interface AdvancedSearchProps {
  type: "investors";
  onSearch: (filters: SearchFilters) => void;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Entrepreneur() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pitchDeck, setPitchDeck] = useState("");
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [receivedInvestmentRequests, setReceivedInvestmentRequests] = useState<InvestmentRequest[]>([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "entrepreneur")) {
      toast({
        title: "Access Denied",
        description: "Only entrepreneurs can access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      if (user) {
        try {
          // Fetch startups
          const startupQuery = query(
            collection(db, "startups"),
            where("ownerId", "==", user.uid)
          );
          const startupSnapshot = await getDocs(startupQuery);
          setStartups(
            startupSnapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as StartupData)
            )
          );

          // Fetch investors
          const investorQuery = query(
            collection(db, "users"),
            where("role", "==", "investor")
          );
          const investorSnapshot = await getDocs(investorQuery);
          const investorList = investorSnapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                name:
                  `${doc.data().firstName || ""} ${doc.data().lastName || ""}`
                    .trim() || `User_${doc.id.slice(0, 8)}`,
                photoURL: doc.data().photoURL,
                verified: doc.data().verified || false,
                industry: doc.data().industry,
                location: doc.data().location,
                investmentRange: doc.data().investmentRange,
              } as Investor)
          );
          setInvestors(investorList);

          // Fetch sent entrepreneur requests
          const sentRequestsQuery = query(
            collection(db, "entrepreneur_requests"),
            where("senderId", "==", user.uid)
          );
          const sentRequestsSnapshot = await getDocs(sentRequestsQuery);
          setSentRequests(
            sentRequestsSnapshot.docs.map(
              (doc) => ({ requestId: doc.id, ...doc.data() } as Request)
            )
          );

          // Fetch received entrepreneur requests
          const receivedRequestsQuery = query(
            collection(db, "entrepreneur_requests"),
            where("receiverId", "==", user.uid)
          );
          const receivedRequestsSnapshot = await getDocs(receivedRequestsQuery);
          setReceivedRequests(
            receivedRequestsSnapshot.docs.map(
              (doc) => ({ requestId: doc.id, ...doc.data() } as Request)
            )
          );

          // Fetch received investment requests
          const investmentRequestsQuery = query(
            collection(db, "investment_requests"),
            where("ownerId", "==", user.uid)
          );
          const investmentRequestsSnapshot = await getDocs(investmentRequestsQuery);
          setReceivedInvestmentRequests(
            investmentRequestsSnapshot.docs.map(
              (doc) =>
                ({
                  requestId: doc.id,
                  ...doc.data(),
                } as InvestmentRequest)
            )
          );
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Failed to load data. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    if (!loading) {
      fetchData();
    }

    if (user) {
      // Real-time listener for sent entrepreneur requests
      const sentRequestsQuery = query(
        collection(db, "entrepreneur_requests"),
        where("senderId", "==", user.uid)
      );
      const unsubscribeSent = onSnapshot(sentRequestsQuery, (snapshot) => {
        const updatedRequests = snapshot.docs.map(
          (doc) =>
            ({
              requestId: doc.id,
              ...doc.data(),
            } as Request)
        );
        setSentRequests(updatedRequests);
      }, (error) => {
        console.error("Error listening to sent requests:", error);
        toast({
          title: "Error",
          description: "Failed to update sent request status.",
          variant: "destructive",
        });
      });

      // Real-time listener for received entrepreneur requests
      const receivedRequestsQuery = query(
        collection(db, "entrepreneur_requests"),
        where("receiverId", "==", user.uid)
      );
      const unsubscribeReceived = onSnapshot(receivedRequestsQuery, (snapshot) => {
        const updatedRequests = snapshot.docs.map(
          (doc) =>
            ({
              requestId: doc.id,
              ...doc.data(),
            } as Request)
        );
        setReceivedRequests(updatedRequests);
      }, (error) => {
        console.error("Error listening to received requests:", error);
        toast({
          title: "Error",
          description: "Failed to update received request status.",
          variant: "destructive",
        });
      });

      // Real-time listener for received investment requests
      const investmentRequestsQuery = query(
        collection(db, "investment_requests"),
        where("ownerId", "==", user.uid)
      );
      const unsubscribeInvestment = onSnapshot(investmentRequestsQuery, (snapshot) => {
        const updatedRequests = snapshot.docs.map(
          (doc) =>
            ({
              requestId: doc.id,
              ...doc.data(),
            } as InvestmentRequest)
        );
        setReceivedInvestmentRequests(updatedRequests);
      }, (error) => {
        console.error("Error listening to investment requests:", error);
        toast({
          title: "Error",
          description: "Failed to update investment request status.",
          variant: "destructive",
        });
      });

      return () => {
        unsubscribeSent();
        unsubscribeReceived();
        unsubscribeInvestment();
      };
    }
  }, [user, loading, router, toast]);

  const handleAddStartup = async () => {
    if (!name || !description || !user) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const startupRef = await addDoc(collection(db, "startups"), {
        name,
        description,
        pitchDeck: pitchDeck || null,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        title: `New Startup: ${name}`,
        description,
        type: "startup",
        createdAt: serverTimestamp(),
      });

      setStartups([
        ...startups,
        { id: startupRef.id, name, description, pitchDeck, ownerId: user.uid },
      ]);
      setName("");
      setDescription("");
      setPitchDeck("");
      toast({
        title: "Success",
        description: "Startup added successfully.",
      });
    } catch (err) {
      console.error("Error adding startup:", err);
      toast({
        title: "Error",
        description: "Failed to add startup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendRequest = async (investorId: string) => {
    if (!user) return;
    try {
      const existingRequest = sentRequests.find(
        (req) => req.receiverId === investorId && req.status === "pending"
      );
      if (existingRequest) {
        toast({
          title: "Invalid Request",
          description: "You already have a pending request to this investor.",
          variant: "destructive",
        });
        return;
      }

      const requestRef = await addDoc(collection(db, "entrepreneur_requests"), {
        senderId: user.uid,
        receiverId: investorId,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Success",
        description: "Connection request sent to investor!",
      });
    } catch (err) {
      console.error("Error sending request:", err);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnectionRequestAction = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await setDoc(doc(db, "entrepreneur_requests", requestId),
 {
        status,
      }, { merge: true });

      toast({
        title: "Success",
        description: `Connection request ${status} successfully!`,
        });
      } catch (err) {
      console.error("Error updating connection request:", err);
      toast({
        title: "Error",
        description: "Failed to update connection request.",
        variant: "destructive",
      });
    }
  };

  const handleInvestmentRequestAction = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await setDoc(doc(db, "investment_requests", requestId),
 {
        status,
      }, { merge: true });

      toast({
        title: "Success",
        description: `Investment request ${status} successfully!`,
      });
    } catch (err) {
      console.error("Error updating investment request:", err);
      toast({
        title: "Error",
        description: "Failed to update investment request.",
        variant: "destructive",
      });
    }
  };

  const openChatModal = (investorId: string, startupId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start a chat.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    if (investorId === user.uid) {
      toast({
        title: "Invalid Action",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }
    setSelectedChat({ investorId: investorId, startupId: startupId });
    setShowChatModal(true);
  };
const handleStartChat = async () => {
  if (!user || !selectedChat || !chatMessage.trim()) {
    toast({
      title: "Error",
      description: "Please log in, select a chat, and enter a valid message.",
      variant: "destructive",
    });
    return;
  }

  try {
    // Check if chat already exists
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      where("itemId", "==", selectedChat.startupId),
      where("itemType", "==", "startup")
    );
    const chatsSnapshot = await getDocs(chatsQuery);
    const existingChat = chatsSnapshot.docs.find((doc) =>
      doc.data().participants.includes(selectedChat.investorId)
    );
    let chatId;

    if (existingChat) {
      chatId = existingChat.id;
    } else {
      // Create new chat
      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        id: chatRef.id,
        participants: [user.uid, selectedChat.investorId],
        itemId: selectedChat.startupId,
        itemType: "startup",
        createdAt: serverTimestamp(),
      });
      chatId = chatRef.id;
    }

    // Send initial message
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: user.uid,
      text: chatMessage,
      timestamp: serverTimestamp(),
    });

    // Notify the investor
    await addDoc(collection(db, `notifications/${selectedChat.investorId}/userNotifications`), {
      type: "chat",
      senderId: user.uid,
      message: `New message from ${user.displayName || "User"}`,
      createdAt: serverTimestamp(),
      read: false,
    });

    toast({
      title: "Success",
      description: "Chat started successfully!",
    });
    setChatMessage("");
    setSelectedChat(null);
    setShowChatModal(false);
    router.push(`/dashboard/chat/${chatId}`);
  } catch (err) {
    console.error("Error starting chat:", err);
    toast({
      title: "Error",
      description: "Failed to start chat. Please try again.",
      variant: "destructive",
    });
  }
};

  const handleSearch = (filters: SearchFilters) => {
    let filtered = investors;
    if (filters.query) {
      filtered = filtered.filter((investor) =>
        investor.name.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    if (filters.industry) {
      filtered = filtered.filter(
        (investor) => investor.industry === filters.industry
      );
    }
    if (filters.location) {
      filtered = filtered.filter(
        (investor) => investor.location === filters.location
      );
    }
    if (filters.investmentRange) {
      filtered = filtered.filter(
        (investor) => investor.investmentRange === filters.investmentRange
      );
    }
    setInvestors(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="flex-1 p-4 ml-0 lg:ml-60 max-w-5xl mx-auto"
      >
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600 text-transparent dark:from-white dark:to-gray-300">
            Entrepreneur Dashboard
          </h1>
          <NotificationBell />
        </header>
        <Card className="mb-6 p-4 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200 text-lg">Add New Startup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Startup Name
              </label>
              <Input
                type="text"
                placeholder="Enter startup name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Input
                type="text"
                placeholder="Enter startup description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pitch Deck URL (Optional)
              </label>
              <Input
                type="text"
                placeholder="Enter pitch deck URL..."
                value={pitchDeck}
                onChange={(e) => setPitchDeck(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleAddStartup}
              className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Startup</span>
            </Button>
          </CardContent>
        </Card>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Your Startups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {startups.map((item) => (
            <article
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800"
            >
              <header className="text-gray-800 dark:text-gray-200 mb-2">
                <h3 className="text-sm">{item.name}</h3>
              </header>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                {item.description}
              </p>
              {item.pitchDeck && (
                <a
                  href={item.pitchDeck}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                >
                  View Pitch Deck
                </a>
              )}
            </article>
          ))}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
          Explore Investors
        </h2>
        <AdvancedSearch type="investors" onSearch={handleSearch} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {investors.length === 0 ? (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 col-span-full">
              No investors found.
            </p>
          ) : (
            investors.map((item) => (
              <InvestorCard
                key={item.id}
                id={item.id}
                name={item.name}
                photoURL={item.photoURL}
                onSendRequest={() => handleSendRequest(item.id)}
                requestStatus={sentRequests.find((req) => req.receiverId === item.id)?.status}
              />
            ))
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
          Received Connection Requests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {receivedRequests.length === 0 ? (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 col-span-full">
              No received connection requests.
            </p>
          ) : (
            receivedRequests.map((request) => (
              <article
                key={request.requestId}
                className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800"
              >
                <header>
                  <h3 className="text-gray-800 dark:text-gray-200 text-sm">
                    From Investor:{" "}
                    {investors.find((i) => i.id === request.senderId)?.name || "Unknown"}
                  </h3>
                </header>
                <p className="text-gray-600 dark:text-gray-400 capitalize text-xs mt-1">
                  Status: {request.status}
                </p>
                {request.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => handleConnectionRequestAction(request.requestId, "accepted")}
                      className="bg-green-500 text-white hover:bg-green-600 text-xs"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleConnectionRequestAction(request.requestId, "rejected")}
                      className="bg-red-500 text-white hover:bg-red-600 text-xs"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
          Received Investment Requests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {receivedInvestmentRequests.length === 0 ? (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 col-span-full">
              No received investment requests.
            </p>
          ) : (
            receivedInvestmentRequests.map((request) => (
              <article
                key={request.requestId}
                className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800"
              >
                <header>
                  <h3 className="text-gray-800 dark:text-gray-200 text-sm">
                    From Investor:{" "}
                    {investors.find((i) => i.id === request.investorId)?.name || "Unknown"}
                  </h3>
                </header>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                  Startup: {startups.find((s) => s.id === request.startupId)?.name || "Unknown"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 capitalize text-xs mt-1">
                  Status: {request.status}
                </p>
                {request.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => handleInvestmentRequestAction(request.requestId, "accepted")}
                      className="bg-green-500 text-white hover:bg-green-600 text-xs"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleInvestmentRequestAction(request.requestId, "rejected")}
                      className="bg-red-500 text-white hover:bg-red-600 text-xs"
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {request.status === "accepted" && (
                  <Button
                    onClick={() => openChatModal(request.investorId, request.startupId)}
                    className="bg-blue-500 text-white hover:bg-blue-600 text-xs mt-2"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Start Chat
                  </Button>
                )}
              </article>
            ))
          )}
        </div>
        <Testimonials />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
          Platform News
        </h2>
        <Newsfeed />
      </motion.div>

      {showChatModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card variant="elevated" className="p-4 max-w-sm w-full bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Start a Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your initial message..."
                variant="outline"
                className="text-sm"
              />
            </CardContent>
            <CardFooter>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  title="Cancel"
                  onClick={() => {
                    setShowChatModal(false);
                    setChatMessage("");
                    setSelectedChat(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  title="Send"
                  onClick={handleStartChat}
                  disabled={!chatMessage.trim()}
                  className="text-xs"
                >
                  Send
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </>
  );
}