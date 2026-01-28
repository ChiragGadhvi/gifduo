import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import ghostIcon from "@/assets/ghost.png";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full py-4 px-4 md:px-12 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <Link to="/">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-primary/5 rounded-xl border border-border">
            <img src={ghostIcon} alt="GifDuo" className="w-5 h-5 md:w-6 md:h-6 opacity-80 dark:invert" />
          </div>
          <span className="text-lg md:text-xl font-display font-bold text-foreground tracking-tighter">
            GIFDUO
          </span>
        </motion.div>
      </Link>

      <nav className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 rounded-md"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </nav>
    </header>
  );
};
