import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-8 px-4 border-t border-border/50 text-center">
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
        Made with <Heart className="w-4 h-4 text-secondary fill-secondary" /> by GifDuo
      </p>
    </footer>
  );
};
