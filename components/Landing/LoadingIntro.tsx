"use client";

import { motion } from "framer-motion";

const LoadingIntro = () => {
  return (
    <div className="overflow-hidden">
      <div className="overflow-hidden">
        <motion.h1
          className="font-editorial mx-auto text-balance text-center text-3xl md:text-5xl lg:text-8xl leading-[1.2] text-white relative z-10 py-1"
          initial={{ y: "110%" }} // Push text slightly further down
          animate={{ y: "0%" }}
          transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
        >
          Your Money, Smarter.
        </motion.h1>
      </div>
      <div className="overflow-hidden">
        <motion.h1
          className="font-editorial mx-auto text-balance text-center text-3xl md:text-5xl lg:text-8xl leading-[1.2] text-white relative z-10 pt-1"
          initial={{ y: "110%" }} // Same fix applied here
          animate={{ y: "0%" }}
          transition={{
            duration: 1,
            ease: [0.65, 0, 0.35, 1],
            delay: 0.2,
          }}
        >
          Your Life, Simpler.
        </motion.h1>
      </div>
    </div>
  );
};

export default LoadingIntro;