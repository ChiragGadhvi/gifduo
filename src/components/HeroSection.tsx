import { motion } from "framer-motion";
import { ArrowDown, Zap, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ghostIcon from "@/assets/ghost.png";

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 gradient-hero-bg" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating ghost icon */}
      <motion.div
        className="absolute opacity-[0.03] pointer-events-none"
        style={{ top: "15%", left: "10%" }}
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={ghostIcon} alt="" className="w-32 h-32 invert" />
      </motion.div>
      
      <motion.div
        className="absolute opacity-[0.03] pointer-events-none"
        style={{ bottom: "20%", right: "8%" }}
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <img src={ghostIcon} alt="" className="w-24 h-24 invert" />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Animated ghost logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={ghostIcon} alt="GifDuo" className="w-16 h-16 invert opacity-90" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Create stunning animated GIFs</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6 leading-[0.95]"
        >
          <span className="text-foreground">Animate Your</span>
          <br />
          <span className="text-muted-foreground">Profile Pictures</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 font-light"
        >
          Transform two photos into eye-catching animated GIFs. Perfect for email
          signatures, social media profiles, and more.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Button variant="hero" size="xl" onClick={onStart}>
            Create Your GIF
            <ArrowDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="lg">
            See Examples
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-12 md:gap-16"
        >
          {[
            { icon: Image, label: "10 Animations" },
            { icon: Zap, label: "Instant Preview" },
            { icon: Sparkles, label: "High Quality" },
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              className="flex items-center gap-3 text-muted-foreground"
              whileHover={{ scale: 1.05, color: "hsl(var(--foreground))" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <feature.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
};
