"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  Zap,
  Target,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import Image from "next/image";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const featureCardVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  hover: {
    y: -10,
    scale: 1.05,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 },
  },
};

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const images = [
    "/images/startup1.jpeg",
    "/images/startup2.jpeg",
    "/images/startup3.jpeg",
    "/images/startup4.jpeg",
  ];

  // Enhanced autoplay with smooth transitions
  useEffect(() => {
    if (isImageHovered) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isImageHovered, images.length]);

  const handleImageError = (src: string) => {
    console.error(`Failed to load image: ${src}`);
    setFailedImages((prev) => [...prev, src]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section with Dynamic Background Images */}
      <motion.section
        className="relative flex flex-col items-center justify-center text-center py-32 px-4 min-h-screen w-full overflow-hidden"
        style={{ y }}
      >
        {/* Image Carousel Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <Image
                src={
                  failedImages.includes(images[currentImage])
                    ? `https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920&h=1080&fit=crop`
                    : images[currentImage]
                }
                alt={`Startup Innovation ${currentImage + 1}`}
                fill
                style={{ objectFit: "cover" }}
                className="opacity-20"
                priority={currentImage === 0}
                onError={() => handleImageError(images[currentImage])}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/80"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            variants={floatingAnimation}
            animate="animate"
            className="mb-8"
          >
            <Logo />
          </motion.div>

          <motion.div
            variants={fadeInScale}
            initial="initial"
            animate="animate"
            className="mb-6"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Revolutionizing Startup Funding
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-5xl md:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
          >
            Startup Connect
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Where visionary entrepreneurs meet forward-thinking investors.
            <br className="hidden md:block" />
            <span className="text-purple-300 font-semibold">
              Transform ideas into reality
            </span>{" "}
            with our cutting-edge platform.
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div variants={fadeInUp}>
              <Button
                asChild
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-lg font-semibold shadow-2xl transform transition-all duration-300 hover:scale-105"
                aria-label="Join as Entrepreneur"
              >
                <Link href="/register">
                  <span className="relative z-10">Join as Entrepreneur</span>
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button
                asChild
                variant="outline"
                className="px-8 py-4 rounded-full text-lg font-semibold border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                aria-label="Join as Investor"
              >
                <Link href="/register">Join as Investor</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button
                asChild
                variant="ghost"
                className="px-8 py-4 rounded-full text-lg font-semibold text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                aria-label="Login"
              >
                <Link href="/login">Login</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        className="relative py-32 px-4 md:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of startup funding with our revolutionary
              platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure & Verified",
                description:
                  "Bank-grade security with OTP verification and encrypted transactions for complete peace of mind.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Connect with investors in minutes, not months. Our AI-powered matching accelerates success.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Target,
                title: "Smart Matching",
                description:
                  "Advanced algorithms connect entrepreneurs with perfectly aligned investors based on industry and goals.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: MessageSquare,
                title: "Real-Time Chat",
                description:
                  "Instant communication with built-in video calls, file sharing, and collaboration tools.",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={featureCardVariants}
                whileHover="hover"
                className="group relative"
              >
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 h-full">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                  ></div>

                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Entrepreneurs" },
              { number: "5K+", label: "Investors" },
              { number: "$50M+", label: "Funded" },
              { number: "98%", label: "Success Rate" },
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="group">
                <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="relative py-32 px-4 mx-4 md:mx-8 rounded-3xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl"></div>

        <div className="relative text-center max-w-4xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
          >
            Ready to Build the Future?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
          >
            Join thousands of successful entrepreneurs and investors who&#39;ve
            transformed their dreams into reality
          </motion.p>

          <motion.div
            variants={fadeInUp}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Button
              asChild
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 rounded-full text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
              aria-label="Get Started Now"
            >
              <Link href="/register">
                <span className="relative z-10">Get Started Now</span>
                <motion.span
                  animate={{ x: isHovered ? 8 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="ml-3 h-6 w-6" />
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity"></div>
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16 px-4 text-center border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Logo />
            <p className="mt-4 text-gray-400 text-lg">
              © 2025 Startup Connect. All rights reserved.
            </p>
            <div className="mt-6 flex justify-center gap-8 text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-purple-400 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
