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
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
      {animations.map((animation, index) => {
        const Icon = animation.icon;
        const isSelected = selected === animation.id;

        return (
          <motion.button
            key={animation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(animation.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300",
              isSelected
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            {animation.popular && (
              <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full text-[7px] font-bold bg-primary text-primary-foreground shadow-sm">
                POP
              </span>
            )}
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                isSelected ? "bg-primary text-primary-foreground shadow-md" : "bg-foreground/5 text-foreground/60"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className={cn(
              "text-[9px] font-bold font-display tracking-tight uppercase truncate w-full text-center",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}>
              {animation.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
