"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function LoadingGate() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // total duration = your orbit (2.2s) + text delay buffer
    const timer = setTimeout(() => {
      setShow(false);
    }, 3500); // adjust if needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-50"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(18px)",
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
        >
          <LoadingScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}