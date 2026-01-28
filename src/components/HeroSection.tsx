import { motion } from "framer-motion";
import { ArrowRight, Zap, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import ghostIcon from "@/assets/ghost.png";

const FLOATING_GIFS = [
  "https://media.giphy.com/media/3o7TKSjPxy4jpACo6Y/giphy.gif",
  "https://media.giphy.com/media/l41lTfX86EOPhT2lG/giphy.gif",
  "https://media.giphy.com/media/u483rU4Y5zGvV6L-Sg/giphy.gif",
  "https://media.giphy.com/media/3o7TKD6qK6C9d0Fj7W/giphy.gif",
  "https://media.giphy.com/media/l41lTfG6W7W0V0U1a/giphy.gif",
  "https://media.giphy.com/media/3o7TKVun7XYEHqe9u8/giphy.gif",
];

export const HeroSection = () => {
  const navigate = useNavigate();

  const gifPositions = useMemo(() => FLOATING_GIFS.map((src, i) => {
    const angle = (i / FLOATING_GIFS.length) * Math.PI * 2;
    return {
      src,
      left: 50 + Math.cos(angle) * (35 + Math.random() * 10),
      top: 50 + Math.sin(angle) * (30 + Math.random() * 10),
      duration: 5 + Math.random() * 5,
      delay: i * 0.5,
    };
  }), []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating GIF Ring */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full max-w-6xl h-full">
          {gifPositions.map((gif, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-primary/20 p-1 bg-background/50 backdrop-blur-sm overflow-hidden shadow-2xl"
              style={{
                left: `${gif.left}%`,
                top: `${gif.top}%`,
                zIndex: 0,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: gif.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: gif.delay,
              }}
            >
              <img src={gif.src} alt="Example" className="w-full h-full object-cover rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Animated ghost logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-6"
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-foreground/5 rounded-3xl p-4 backdrop-blur-md border border-foreground/10"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={ghostIcon} alt="GifDuo" className="w-full h-full invert opacity-90" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary uppercase tracking-tighter">New Version 2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight mb-8 leading-[0.85] text-balance"
        >
          <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Make Your</span>
          <br />
          <span className="text-muted-foreground/40 italic">Profile Alive</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-16 font-light leading-relaxed px-4 text-balance"
        >
          Effortlessly transform two photos into high-quality animated GIFs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:flex items-center justify-center gap-5 mb-24 px-4"
        >
          <Button 
            variant="hero" 
            size="xl" 
            onClick={() => navigate("/create")}
            className="group px-12 py-8 text-xl h-auto rounded-2xl shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all hover:shadow-[0_0_60px_rgba(var(--primary),0.5)] active:scale-95"
          >
            Start Creating
            <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" className="h-auto py-8 px-10 text-xl rounded-2xl backdrop-blur-md border-foreground/10 hover:bg-foreground/5 transition-all">
            See Showcase
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {[
            { icon: Image, label: "20+ Frames" },
            { icon: Zap, label: "GPU Accelerated" },
            { icon: Sparkles, label: "Lossless Export" },
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              className="flex items-center gap-4 text-foreground/80"
              whileHover={{ scale: 1.1, color: "hsl(var(--primary))" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <feature.icon className="w-5 h-5" />
              </div>
              <span className="text-base font-bold tracking-tight">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};
