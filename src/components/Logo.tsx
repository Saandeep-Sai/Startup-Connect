import Image from "next/image";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] } },
};

export function Logo() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="flex justify-center mb-4"
    >
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-2">
        <Image
          src="/Logo.jpeg"
          alt="Startup Connect Logo"
          width={96}
          height={96}
          className="rounded-full object-cover"
        />
      </div>
    </motion.div>
  );
}