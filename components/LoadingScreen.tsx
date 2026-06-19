"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingScreen() {
  const [start, setStart] = useState(false);
  const [exit, setExit] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    setStart(true);

    // longer “system presence” phase
    const exitTimer = setTimeout(() => {
      setExit(true);
    }, 3200); // ⬅️ slowed down from ~2.2s → 3.2s

    // slower transition to dashboard
    const routeTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 4200); // ⬅️ gives full cinematic fade time

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(routeTimer);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouse({
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0B0C0E]"
      onMouseMove={handleMouseMove}
    >

      {/* ========================= */}
      {/* DARK BASE */}
      {/* ========================= */}
      <div className="absolute inset-0 bg-[#0B0C0E]" />

      {/* ========================= */}
      {/* CURSOR GRID */}
      {/* ========================= */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
          opacity: exit ? 0.2 : 1,

          WebkitMaskImage: `radial-gradient(circle 200px at ${mouse.x}px ${mouse.y}px, black 0%, transparent 70%)`,
          maskImage: `radial-gradient(circle 200px at ${mouse.x}px ${mouse.y}px, black 0%, transparent 70%)`,
        }}
      />

      {/* ========================= */}
      {/* MICRO GRID */}
      {/* ========================= */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          opacity: exit ? 0 : 1,

          WebkitMaskImage: `radial-gradient(circle 130px at ${mouse.x}px ${mouse.y}px, black 0%, transparent 70%)`,
          maskImage: `radial-gradient(circle 130px at ${mouse.x}px ${mouse.y}px, black 0%, transparent 70%)`,
        }}
      />

      {/* ========================= */}
      {/* CENTER O° */}
      {/* ========================= */}
      <motion.div
        animate={
          exit
            ? { scale: 1.05, opacity: 0 }   // ❗ NO zoom, just soft dissolve
            : { scale: 1, opacity: 1 }
        }
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
        className="relative w-[120px] h-[120px] flex items-center justify-center"
      >

        {/* O */}
        <div className="text-[#E8E5DE] text-7xl font-light">
          O
        </div>

        {/* ORBIT */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={start ? { rotate: 360 } : {}}
          transition={{
            duration: 3.2,   // ⬅️ slowed orbit
            ease: "easeInOut",
          }}
        >

          {/* GREEN WAND TRAIL */}
          <div className="absolute" style={{
            top: "15px",
            right: "15px",
            width: "26px",
            height: "26px",
            borderRadius: "999px",
            background: "rgba(34,197,94,0.25)",
            filter: "blur(14px)",
          }} />

          <div className="absolute" style={{
            top: "15px",
            right: "15px",
            width: "18px",
            height: "18px",
            borderRadius: "999px",
            background: "rgba(34,197,94,0.45)",
            filter: "blur(10px)",
          }} />

          <div className="absolute" style={{
            top: "15px",
            right: "15px",
            width: "10px",
            height: "10px",
            borderRadius: "999px",
            background: "rgba(34,197,94,0.7)",
            filter: "blur(6px)",
          }} />

          {/* DEGREE */}
          <div
            className="absolute text-5xl font-light"
            style={{
              top: "15px",
              right: "15px",
              color: "#ffffff",
            }}
          >
            °
          </div>

        </motion.div>

      </motion.div>

      {/* ========================= */}
      {/* POIMTER */}
      {/* ========================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={
          exit
            ? { opacity: 0 }
            : start
            ? { opacity: 1, y: 0 }
            : {}
        }
        transition={{
          duration: 1.2,
          ease: "easeOut",
        }}
        className="absolute bottom-20 text-[#E8E5DE] text-sm font-light tracking-[0.35em]"
      >
        POIMTER
      </motion.div>

    </div>
  );
}