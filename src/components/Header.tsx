import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full py-6 px-8 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold gradient-text">GifDuo</span>
      </motion.div>

      <motion.nav
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-6"
      >
        <a
          href="#create"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Create
        </a>
        <a
          href="#examples"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Examples
        </a>
      </motion.nav>
    </header>
  );
};
