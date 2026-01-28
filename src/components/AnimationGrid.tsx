import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Blend,
  ArrowRight,
  ZoomIn,
  RotateCcw,
  Sparkles,
  ChevronsRight,
  Zap,
  ArrowDownUp,
  SplitSquareHorizontal,
  Wand2,
} from "lucide-react";

export type AnimationType =
  | "fade"
  | "slide"
  | "zoom"
  | "flip"
  | "dissolve"
  | "wipe"
  | "glitch"
  | "bounce"
  | "split"
  | "morph";

interface AnimationOption {
  id: AnimationType;
  name: string;
  icon: React.ElementType;
  description: string;
  popular?: boolean;
}

const animations: AnimationOption[] = [
  { id: "fade", name: "Fade", icon: Blend, description: "Smooth crossfade" },
  { id: "slide", name: "Slide", icon: ArrowRight, description: "Directional slide", popular: true },
  { id: "zoom", name: "Zoom", icon: ZoomIn, description: "Zoom in/out" },
  { id: "flip", name: "Flip", icon: RotateCcw, description: "3D rotation" },
  { id: "dissolve", name: "Dissolve", icon: Sparkles, description: "Pixel blend" },
  { id: "wipe", name: "Wipe", icon: ChevronsRight, description: "Reveal wipe", popular: true },
  { id: "glitch", name: "Glitch", icon: Zap, description: "Glitchy effect" },
  { id: "bounce", name: "Bounce", icon: ArrowDownUp, description: "Playful bounce" },
  { id: "split", name: "Split", icon: SplitSquareHorizontal, description: "Split reveal" },
  { id: "morph", name: "Morph", icon: Wand2, description: "Smooth morph", popular: true },
];

interface AnimationGridProps {
  selected: AnimationType;
  onSelect: (animation: AnimationType) => void;
}

export const AnimationGrid = ({ selected, onSelect }: AnimationGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {animations.map((animation, index) => {
        const Icon = animation.icon;
        const isSelected = selected === animation.id;

        return (
          <motion.button
            key={animation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(animation.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200",
              isSelected
                ? "border-foreground bg-secondary"
                : "border-border hover:border-foreground/50 hover:bg-secondary/50"
            )}
          >
            {animation.popular && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-foreground text-background">
                ★
              </span>
            )}
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                isSelected ? "bg-foreground" : "bg-secondary"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isSelected ? "text-background" : "text-foreground"
                )}
              />
            </div>
            <span className="text-[11px] font-medium font-display">{animation.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
