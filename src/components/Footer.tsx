import ghostIcon from "@/assets/ghost.png";

export const Footer = () => {
  return (
    <footer className="py-12 px-8 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={ghostIcon} alt="GifDuo" className="w-5 h-5 invert opacity-60" />
          <span className="text-sm text-muted-foreground">
            Made with precision
          </span>
        </div>

        <div className="flex items-center gap-8">
          <a
            href="#create"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Create
          </a>
          <a
            href="#examples"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Examples
          </a>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} GifDuo
        </p>
      </div>
    </footer>
  );
};
