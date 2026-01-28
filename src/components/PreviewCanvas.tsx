import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimationType } from "./AnimationGrid";
import { GifSettings } from "./SettingsPanel";
import { cn } from "@/lib/utils";

interface PreviewCanvasProps {
  images: string[];
  animation: AnimationType;
  settings: GifSettings;
}

const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  zoom: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 2, opacity: 0 },
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
  dissolve: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
  },
  wipe: {
    initial: { clipPath: "inset(0 100% 0 0)" },
    animate: { clipPath: "inset(0 0% 0 0)" },
    exit: { clipPath: "inset(0 0 0 100%)" },
  },
  glitch: {
    initial: { opacity: 0, x: -20, filter: "hue-rotate(90deg)" },
    animate: { opacity: 1, x: 0, filter: "hue-rotate(0deg)" },
    exit: { opacity: 0, x: 20, filter: "hue-rotate(-90deg)" },
  },
  bounce: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
  },
  split: {
    initial: { scaleX: 0, opacity: 0 },
    animate: { scaleX: 1, opacity: 1 },
    exit: { scaleX: 0, opacity: 0 },
  },
  morph: {
    initial: { borderRadius: "50%", scale: 0.5, opacity: 0 },
    animate: { borderRadius: "0%", scale: 1, opacity: 1 },
    exit: { borderRadius: "50%", scale: 0.5, opacity: 0 },
  },
} as const;

const getFilterStyle = (filter: string) => {
  switch (filter) {
    case "grayscale":
      return "grayscale(100%)";
    case "sepia":
      return "sepia(100%)";
    case "vintage":
      return "sepia(40%) contrast(110%) saturate(80%)";
    case "vibrant":
      return "saturate(150%) contrast(110%)";
    default:
      return "none";
  }
};

export const PreviewCanvas = ({
  images,
  animation,
  settings,
}: PreviewCanvasProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [darkBg, setDarkBg] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cycleImage = useCallback(() => {
    if (images.length < 2) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (isPlaying && images.length >= 2) {
      const totalDuration = (settings.duration + settings.pauseDuration) * 1000;
      intervalRef.current = setInterval(cycleImage, totalDuration);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, settings.duration, settings.pauseDuration, cycleImage, images.length]);

  const restart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying((prev) => !prev);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyR") {
        restart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const variants = animationVariants[animation];
  const filterStyle = getFilterStyle(settings.filter);
  const [width, height] = settings.outputSize.split("x").map(Number);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className={cn(
            "rounded-2xl border-2 border-dashed border-border flex items-center justify-center",
            darkBg ? "bg-foreground/10" : "bg-muted/50"
          )}
          style={{ width: Math.min(width, 400), height: Math.min(height, 400) }}
        >
          <p className="text-muted-foreground text-center px-8">
            Upload 2 images to see the preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden shadow-elevated transition-colors duration-300",
          darkBg ? "bg-foreground" : "bg-muted"
        )}
        style={{ width: Math.min(width, 400), height: Math.min(height, 400) }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Preview ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: filterStyle }}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: settings.duration }}
          />
        </AnimatePresence>

        {/* Image indicator */}
        {images.length >= 2 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentIndex ? "bg-primary" : "bg-primary/30"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={restart}
          className="rounded-full"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDarkBg((prev) => !prev)}
          className="rounded-full"
        >
          {darkBg ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 rounded bg-muted font-mono">Space</kbd> to play/pause,{" "}
        <kbd className="px-1 py-0.5 rounded bg-muted font-mono">R</kbd> to restart
      </p>
    </div>
  );
};
