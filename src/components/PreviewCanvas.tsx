import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Sun, Moon, Image as ImageIcon } from "lucide-react";
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
  const [lightBg, setLightBg] = useState(false);
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
            "rounded-2xl border border-dashed border-border flex items-center justify-center transition-colors duration-300",
            lightBg ? "bg-black/5" : "bg-muted"
          )}
          style={{ width: Math.min(width, 350), height: Math.min(height, 350) }}
        >
          <div className="text-center px-8">
            <ImageIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm font-medium">
              Upload 2 images to <br /> see the preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden border border-border shadow-xl transition-colors duration-300",
          lightBg ? "bg-white" : "bg-black"
        )}
        style={{ width: Math.min(width, 350), height: Math.min(height, 350) }}
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Preview ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: filterStyle }}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: settings.duration, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="rounded-full w-9 h-9"
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
          className="rounded-full w-9 h-9"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLightBg((prev) => !prev)}
          className="rounded-full w-9 h-9"
        >
          {lightBg ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[10px]">Space</kbd> play/pause · 
        <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[10px] ml-1">R</kbd> restart
      </p>
    </div>
  );
};
