import { motion } from "framer-motion";
import ghostIcon from "@/assets/ghost.png";

export const Header = () => {
  return (
    <header className="w-full py-5 px-8 flex items-center justify-between border-b border-border/50 bg-background/90 backdrop-blur-md sticky top-0 z-50">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <motion.div 
          className="w-10 h-10 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <img src={ghostIcon} alt="GifDuo" className="w-8 h-8 invert opacity-90" />
        </motion.div>
        <span className="text-xl font-display font-bold text-foreground tracking-tight">
          GifDuo
        </span>
      </motion.div>

      <motion.nav
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-8"
      >
        <a
          href="#create"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Create
        </a>
        <a
          href="#examples"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Examples
        </a>
      </motion.nav>
    </header>
  );
};
