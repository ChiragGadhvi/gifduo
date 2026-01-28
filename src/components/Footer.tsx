import { Link } from "react-router-dom";
import ghostIcon from "@/assets/ghost.png";

export const Footer = () => {
  return (
    <footer className="py-6 px-4 md:px-12 border-t border-border bg-background mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center border border-border">
            <img src={ghostIcon} alt="GifDuo" className="w-3.5 h-3.5 opacity-80 dark:invert" />
          </div>
          <span className="text-xs font-display font-bold tracking-tighter">GIFDUO</span>
          <span className="hidden md:inline text-[10px] text-muted-foreground/50 ml-4 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/create"
            className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest"
          >
            Create
          </Link>
          <Link
            to="/"
            className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest"
          >
            Showcase
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest"
          >
            Github
          </a>
        </div>
      </div>
    </footer>
  );
};
